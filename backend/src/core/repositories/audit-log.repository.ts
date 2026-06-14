import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { AuditLog } from '@prisma/client';

@Injectable()
export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.auditLog;
  }
}
