import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { RefreshToken } from '@prisma/client';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.refreshToken;
  }

  get modelName() {
    return 'refreshToken';
  }
}
