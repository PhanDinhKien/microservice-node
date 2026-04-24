import { Controller, Post, Body, Inject, HttpException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '../../dto/auth/register.dto';
import { LoginDto } from '../../dto/auth/login.dto';
import { firstValueFrom, catchError, throwError } from 'rxjs';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản' })
  async register(@Body() data: RegisterDto) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'auth_register' }, data).pipe(
        catchError((err) => throwError(() => new HttpException(err.message ?? err, err.status ?? 500))),
      ),
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập' })
  async login(@Body() data: LoginDto) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'auth_login' }, data).pipe(
        catchError((err) => throwError(() => new HttpException(err.message ?? err, err.status ?? 500))),
      ),
    );
  }

  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất' })
  async logout(@Body() data: { refresh_token: string }) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'auth_logout' }, data).pipe(
        catchError((err) => throwError(() => new HttpException(err.message ?? err, err.status ?? 500))),
      ),
    );
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Lấy access token mới' })
  async refreshToken(@Body() data: { refresh_token: string }) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'auth_refresh_token' }, data).pipe(
        catchError((err) => throwError(() => new HttpException(err.message ?? err, err.status ?? 500))),
      ),
    );
  }
}
