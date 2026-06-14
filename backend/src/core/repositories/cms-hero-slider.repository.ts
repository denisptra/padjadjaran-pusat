import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { CmsHeroSlider } from '@prisma/client';

@Injectable()
export class CmsHeroSliderRepository extends BaseRepository<CmsHeroSlider> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.cmsHeroSlider;
  }
}
