import { Controller, Get, Post, Body, Inject, HttpException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../../dto/create-user.dto';
import { firstValueFrom, catchError, throwError } from 'rxjs';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo user mới' })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() data: CreateUserDto) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'create_user' }, data).pipe(
        catchError((err) => throwError(() => new HttpException(err.message ?? err, err.status ?? 500))),
      ),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách users' })
  async getUsers() {
    return firstValueFrom(
      this.authClient.send({ cmd: 'get_users' }, {}).pipe(
        catchError((err) => throwError(() => new HttpException(err.message ?? err, err.status ?? 500))),
      ),
    );
  }
}
