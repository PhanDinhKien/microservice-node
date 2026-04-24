import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';
import { RefreshTokensRepository } from '../auth/repositories/refresh-tokens.repository';
import { AuthController } from '../auth/controllers/auth.controller';
import { AuthService } from '../auth/services/auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService, 
    AuthService, 
    UsersRepository,
    RefreshTokensRepository,
  ],
  exports: [UsersService, AuthService],
})
export class UsersModule {}
