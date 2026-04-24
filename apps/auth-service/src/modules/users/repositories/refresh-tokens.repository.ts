import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RefreshTokensRepository {
  constructor(private prisma: PrismaService) {}

  public async create(userId: string, token: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: {
        token,
        expires_at: expiresAt,
        user: { connect: { id: userId } }
      }
    });
  }

  public async findUnique(token: string) {
    return this.prisma.refreshToken.findUnique({ 
      where: { token },
      include: { user: true }
    });
  }

  public async updateRevoked(token: string) {
    return this.prisma.refreshToken.update({
      where: { token },
      data: { is_revoked: true }
    });
  }

  public async deleteExpired() {
    return this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expires_at: { lt: new Date() } },
          { is_revoked: true }
        ]
      }
    });
  }
}
