import { Controller, Post } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { RegisterDto } from "../dto/auth/register.dto";
import { LoginDto } from "../dto/auth/login.dto";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('register')
  @MessagePattern({ cmd: 'auth_register' })
  register(@Payload() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('login')
  @MessagePattern({ cmd: 'auth_login' })
  login(@Payload() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('logout')
  @MessagePattern({ cmd: 'auth_logout' })
  logout(@Payload() data: { refresh_token: string }) {
    return this.authService.logout(data.refresh_token);
  }

  @Post('refresh-token')
  @MessagePattern({ cmd: 'auth_refresh_token' })
  refreshToken(@Payload() data: { refresh_token: string }) {
    return this.authService.refreshToken(data.refresh_token);
  }
}
