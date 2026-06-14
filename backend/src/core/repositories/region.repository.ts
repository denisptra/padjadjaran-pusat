import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { Region } from '@prisma/client';

@Injectable()
export class RegionRepository extends BaseRepository<Region> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.region;
  }
}
