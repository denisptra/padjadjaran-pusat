import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RegionMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async getRegionMembers(adminId: string) {
    const region = await this.prisma.region.findUnique({
      where: { adminId },
    });

    if (!region) {
      return [];
    }

    const members = await this.prisma.memberProfile.findMany({
      where: { regionId: region.id, user: { role: Role.member } },
      include: { user: { select: { email: true, status: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return members.map(m => ({
      ...m,
      email: m.user?.email,
      status: m.user?.status,
    }));
  }

  async getRegionMemberById(adminId: string, memberId: string) {
    const region = await this.prisma.region.findUnique({
      where: { adminId },
    });

    if (!region) {
      throw new NotFoundException('Region not found for this admin');
    }

    const member = await this.prisma.memberProfile.findFirst({
      where: {
        id: memberId,
        regionId: region.id,
      },
      include: { user: { select: { email: true, status: true, role: true, createdAt: true } } },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this region');
    }

    return {
      ...member,
      email: member.user?.email,
      status: member.user?.status,
    };
  }
}
