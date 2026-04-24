import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  public async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  public async findAll() {
    return this.prisma.user.findMany();
  }
}