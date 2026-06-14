import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { FeatureControl } from '@prisma/client';

@Injectable()
export class FeatureControlRepository extends BaseRepository<FeatureControl> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.featureControl;
  }
}
