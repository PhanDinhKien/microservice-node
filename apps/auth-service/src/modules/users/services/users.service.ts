import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(data: CreateUserDto) {
    return this.usersRepository.create(data);
  }

  async getUsers() {
    try {
      const result = await this.usersRepository.findAll();
      console.log('[DEBUG] getUsers result:', result);
      return result;
    } catch (err) {
      console.error('[DEBUG] getUsers ERROR:', err);
      throw err;
    }
  }
}
