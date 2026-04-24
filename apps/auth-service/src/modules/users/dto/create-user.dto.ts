export class CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone_number: string;
  address?: string;
  avatar?: string;
  status?: string;
}

