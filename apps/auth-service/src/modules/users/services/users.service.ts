import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(dto: CreateUserDto) {
    const password_hash = await bcrypt.hash(dto.password, 10);
    const { password, ...rest } = dto;

    return this.usersRepository.create({
      ...rest,
      password_hash,
    });
  }

  async getUsers() {
    try {
      const result = await this.usersRepository.findAll();
      return result;
    } catch (err) {
      throw err;
    }
  }
}
