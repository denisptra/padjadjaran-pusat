import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { OtpToken } from '@prisma/client';

@Injectable()
export class OtpTokenRepository extends BaseRepository<OtpToken> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.otpToken;
  }

  get modelName() {
    return 'otpToken';
  }
}
