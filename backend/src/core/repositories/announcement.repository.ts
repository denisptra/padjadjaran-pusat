import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { Announcement } from '@prisma/client';

@Injectable()
export class AnnouncementRepository extends BaseRepository<Announcement> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.announcement;
  }
}
