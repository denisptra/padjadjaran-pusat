import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { CmsGuruBesar } from '@prisma/client';

@Injectable()
export class CmsGuruBesarRepository extends BaseRepository<CmsGuruBesar> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.cmsGuruBesar;
  }
}
