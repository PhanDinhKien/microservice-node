import { Controller, Get, Post, Body, Inject, HttpException, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBody, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from '../../dto/create-user.dto';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo user mới' })
  @ApiBody({ type: CreateUserDto })
  // Ví dụ: Chỉ cho phép Admin hoặc người có quyền user:create tạo user
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user:create')
  async createUser(@Body() data: CreateUserDto) {
    return firstValueFrom(
      this.authClient.send({ cmd: 'create_user' }, data).pipe(
        catchError((err) => throwError(() => new HttpException(err.message ?? err, err.status ?? 500))),
      ),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách users' })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user:read')
  async getUsers() {
    return firstValueFrom(
      this.authClient.send({ cmd: 'get_users' }, {}).pipe(
        catchError((err) => throwError(() => new HttpException(err.message ?? err, err.status ?? 500))),
      ),
    );
  }
}
