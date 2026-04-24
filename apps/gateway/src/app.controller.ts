import { Controller, Get, Post, Body, Inject, HttpException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateUserDto } from './dto/create-user.dto';
import { firstValueFrom, catchError, throwError } from 'rxjs';

@ApiTags('Users')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Hello world' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('auth-hello')
  @ApiOperation({ summary: 'Test kết nối auth-service' })
  async getAuthHello() {
    return firstValueFrom(
      this.authClient.send({ cmd: 'get_hello' }, {}).pipe(
        catchError((err) => throwError(() => new HttpException(err.message ?? err, 500))),
      ),
    );
  }

  @Post('users')
  @ApiOperation({ summary: 'Tạo user mới' })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() data: CreateUserDto) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'create_user' }, data).pipe(
        catchError((err) => throwError(() => new HttpException(err.message ?? err, 500))),
      ),
    );
  }

  @Get('users')
  @ApiOperation({ summary: 'Lấy danh sách users' })
  async getUsers() {
    return firstValueFrom(
      this.authClient.send({ cmd: 'get_users' }, {}).pipe(
        catchError((err) => throwError(() => new HttpException(err.message ?? err, 500))),
      ),
    );
  }
}
