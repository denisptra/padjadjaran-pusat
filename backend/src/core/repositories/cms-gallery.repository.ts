import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { CmsGallery } from '@prisma/client';

@Injectable()
export class CmsGalleryRepository extends BaseRepository<CmsGallery> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.cmsGallery;
  }
}
