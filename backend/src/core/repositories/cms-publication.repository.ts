import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { CmsPublication } from '@prisma/client';

@Injectable()
export class CmsPublicationRepository extends BaseRepository<CmsPublication> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.cmsPublication;
  }
}
