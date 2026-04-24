import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from "../dto/auth/register.dto";
import { LoginDto } from "../dto/auth/login.dto";
import { UsersRepository } from "../repositories/users.repository";
import { RefreshTokensRepository } from "../repositories/refresh-tokens.repository";

@Injectable() 
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getTokens(userId: string, email: string, permissions: string[]) {
    const jwtPayload = {
      sub: userId,
      email: email,
      permissions: permissions,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async register(data: RegisterDto) {
    const { password, email, ...rest } = data;

    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const password_hash = await bcrypt.hash(password, 10);

    return this.usersRepository.create({
      ...rest,
      email,
      password_hash,
    });
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const permissions = user.user_roles.flatMap(ur => 
      ur.role.role_permissions.map(rp => rp.permission.permission_key)
    );

    const tokens = await this.getTokens(user.id, user.email, permissions);

    const rtExpiresIn = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + rtExpiresIn);
    
    await this.refreshTokensRepository.create(user.id, tokens.refresh_token, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone_number: user.phone_number
      },
      ...tokens,
    };
  }

  async logout(refreshToken: string) {
    await this.refreshTokensRepository.updateRevoked(refreshToken);
    return { message: 'Logged out successfully' };
  }

  async refreshToken(token: string) {
    const rt = await this.refreshTokensRepository.findUnique(token);
    
    if (!rt || rt.is_revoked || rt.expires_at < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersRepository.findByEmail(rt.user.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const permissions = user.user_roles.flatMap(ur => 
      ur.role.role_permissions.map(rp => rp.permission.permission_key)
    );

    const tokens = await this.getTokens(user.id, user.email, permissions);

    await this.refreshTokensRepository.updateRevoked(token);
    
    const rtExpiresIn = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + rtExpiresIn);
    await this.refreshTokensRepository.create(user.id, tokens.refresh_token, expiresAt);

    return tokens;
  }
}