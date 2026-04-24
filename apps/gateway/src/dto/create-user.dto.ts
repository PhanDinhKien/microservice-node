import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email người dùng' })
  email: string;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Tên người dùng' })
  name: string;

  @ApiProperty({ example: '0912345678', description: 'Số điện thoại' })
  phoneNumber: string;

  @ApiPropertyOptional({ example: '123 Đường ABC, TP.HCM', description: 'Địa chỉ' })
  address?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'URL avatar' })
  avatar?: string;
}
