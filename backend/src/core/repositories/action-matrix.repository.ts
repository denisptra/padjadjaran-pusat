import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { ActionMatrix } from '@prisma/client';

@Injectable()
export class ActionMatrixRepository extends BaseRepository<ActionMatrix> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.actionMatrix;
  }
}
