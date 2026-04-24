import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email người dùng', maxLength: 255 })
  email: string;

  @ApiProperty({ example: 'Nguyen Van A', description: 'Tên người dùng', maxLength: 100 })
  name: string;

  @ApiProperty({ example: '0912345678', description: 'Số điện thoại', maxLength: 20 })
  phone_number: string;

  @ApiPropertyOptional({ example: '123 Đường ABC, TP.HCM', description: 'Địa chỉ', maxLength: 500 })
  address?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'URL avatar', maxLength: 500 })
  avatar?: string;

  @ApiPropertyOptional({ example: 'active', description: 'Trạng thái tài khoản', maxLength: 20, default: 'active' })
  status?: string;
}
