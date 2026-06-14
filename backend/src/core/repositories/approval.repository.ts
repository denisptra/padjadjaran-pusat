import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { Approval } from '@prisma/client';

@Injectable()
export class ApprovalRepository extends BaseRepository<Approval> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.approval;
  }
}
