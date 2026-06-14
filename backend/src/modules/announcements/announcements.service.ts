import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AnnouncementRepository } from '../../core/repositories/announcement.repository';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly announcementRepository: AnnouncementRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: any, currentUser: any) {
    const { page, limit, search, sortBy, sortOrder, scope, isPublished } = query;

    const where: any = {};

    // For members, we only show published announcements
    if (currentUser?.role === Role.member) {
      where.isPublished = true;
    } else {
      // For admins, if isPublished parameter is specified, filter by it
      if (isPublished !== undefined) {
        where.isPublished = isPublished === true || isPublished === 'true';
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (scope) {
      if (scope === 'national') {
        where.scope = 'national';
      } else if (scope === 'wilayah' || scope === 'region') {
        where.scope = { in: ['region', 'province'] };
      }
    }

    // Region Logic - use Region.adminId for admin_wilayah, profile.regionId for members
    let userRegionId = null;
    if (currentUser && currentUser.id) {
      if (currentUser.role === 'admin_wilayah') {
        // Admin Wilayah: get their region via Region.adminId
        const region = await this.prisma.region.findUnique({
          where: { adminId: currentUser.id },
        });
        userRegionId = region?.id;
      } else {
        // Member: get their region from member profile
        const profile = await this.prisma.memberProfile.findUnique({
          where: { userId: currentUser.id },
        });
        userRegionId = profile?.regionId;
      }
    }

    // Scope Filtering Logic
    const scopeFilters: any[] = [];

    // 1. National announcements are for everyone
    scopeFilters.push({ scope: 'national' });

    if (currentUser && currentUser.id) {
      if (currentUser.role === Role.member) {
        const profile = await this.prisma.memberProfile.findUnique({
          where: { userId: currentUser.id },
        });
        if (profile) {
          // 2. Province-targeted announcements matching member's province
          if (profile.regionId) {
            const region = await this.prisma.region.findUnique({
              where: { id: profile.regionId },
            });
            if (region?.provinceId) {
              scopeFilters.push({
                scope: 'province',
                targetProvinces: { has: region.provinceId },
              });
            }
            // 3. Region-targeted announcements matching member's region
            scopeFilters.push({
              scope: 'region',
              targetRegions: { has: profile.regionId },
            });
          }
        }
      } else if (currentUser.role === Role.admin_wilayah) {
        const region = await this.prisma.region.findUnique({
          where: { adminId: currentUser.id },
        });
        if (region) {
          // Admin wilayah see their province and region targets too
          scopeFilters.push({
            scope: 'province',
            targetProvinces: { has: region.provinceId },
          });
          scopeFilters.push({
            scope: 'region',
            targetRegions: { has: region.id },
          });
        }
      } else {
        // Admin Pusat/Super Admin see everything
        // (Handled by not applying these filters or just allowing all scopes)
        if (
          currentUser.role === Role.admin_pusat ||
          currentUser.role === Role.super_admin
        ) {
          // Don't restrict scope filters for high admins
          delete where.isPublished; // Already handled above but reinforcing
        }
      }
    }

    if (
      currentUser.role === Role.member ||
      currentUser.role === Role.admin_wilayah
    ) {
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: scopeFilters }];
        delete where.OR;
      } else {
        where.OR = scopeFilters;
      }
    }

    const result = await this.announcementRepository.paginate({
      where,
      page,
      limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      include: { 
        author: { include: { profile: { include: { region: true } } } },
        readBy: { where: { userId: currentUser.id } },
        _count: {
          select: { readBy: true }
        }
      },
    });

    // Resolve target names for UI convenience
    const allRegions = await this.prisma.region.findMany({
      select: { id: true, name: true },
    });

    result.data = result.data.map((a: any) => {
      let resolvedTargets: string[] = [];
      const toTitleCase = (str: string) =>
        str
          ? str
              .toLowerCase()
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
          : '';

      if (a.scope === 'region' && a.targetRegions?.length > 0) {
        resolvedTargets = allRegions
          .filter((r) => a.targetRegions.includes(r.id))
          .map((r) => toTitleCase(r.name));
      }

      return {
        ...a,
        scope: a.scope, // Preserve the actual scope (national/region) from DB
        resolvedTargets,
        authorName: a.author?.profile?.fullName || a.author?.email || 'Sistem',
        authorRegionName: a.author?.profile?.region?.name || null,
        isRead: a.readBy && a.readBy.length > 0,
        viewCount: a._count?.readBy || 0,
      };
    });

    return result;
  }

  async create(data: any, currentUser: any) {
    const isPublished =
      data.status === 'published' || data.isPublished === true;
    let scope = data.scope || 'national';
    let targetProvinces = data.targetProvinces || [];
    let targetRegions = data.targetRegions || [];

    // ENFORCEMENT: Admin Wilayah can only target their own region
    if (currentUser.role === Role.admin_wilayah) {
      const region = await this.prisma.region.findUnique({
        where: { adminId: currentUser.id },
      });
      if (!region) throw new Error('Anda tidak memiliki wilayah yang dikelola');

      scope = 'region';
      targetProvinces = [];
      targetRegions = [region.id];
    }

    return this.announcementRepository.create({
      title: data.title,
      content: data.content,
      isPublished,
      showModal: data.showModal || false,
      authorId: currentUser.id,
      scope,
      targetProvinces,
      targetRegions,
    });
  }

  async update(id: string, data: any, currentUser: any) {
    const announcement = await this.findOne(id);

    // ENFORCEMENT: Admin Wilayah can ONLY update their own announcements
    if (
      currentUser.role === Role.admin_wilayah &&
      announcement.authorId !== currentUser.id
    ) {
      throw new Error(
        'Anda tidak memiliki izin untuk mengubah pengumuman yang dibuat oleh Admin Pusat.',
      );
    }

    const isPublished =
      data.status === 'published' || data.isPublished === true;
    let scope = data.scope !== undefined ? data.scope : announcement.scope;
    let targetProvinces =
      data.targetProvinces !== undefined
        ? data.targetProvinces
        : announcement.targetProvinces;
    let targetRegions =
      data.targetRegions !== undefined
        ? data.targetRegions
        : announcement.targetRegions;

    // ENFORCEMENT: Admin Wilayah can only target their own region
    if (currentUser.role === Role.admin_wilayah) {
      const region = await this.prisma.region.findUnique({
        where: { adminId: currentUser.id },
      });
      if (!region) throw new Error('Anda tidak memiliki wilayah yang dikelola');

      scope = 'region';
      targetProvinces = [];
      targetRegions = [region.id];
    }

    return this.announcementRepository.update(
      { id },
      {
        title: data.title,
        content: data.content,
        isPublished,
        showModal:
          data.showModal !== undefined
            ? data.showModal
            : announcement.showModal,
        scope,
        targetProvinces,
        targetRegions,
      },
    );
  }

  async delete(id: string, currentUser: any) {
    const announcement = await this.findOne(id);

    // ENFORCEMENT: Admin Wilayah can ONLY delete their own announcements
    if (
      currentUser.role === Role.admin_wilayah &&
      announcement.authorId !== currentUser.id
    ) {
      throw new Error(
        'Anda tidak memiliki izin untuk menghapus pengumuman yang dibuat oleh Admin Pusat.',
      );
    }

    return this.announcementRepository.delete({ id });
  }

  async findOne(id: string) {
    const announcement = await this.announcementRepository.findOne(
      { id },
      {
        author: { include: { profile: { include: { region: true } } } },
        _count: { select: { readBy: true } },
      },
    );

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    const a = announcement as any;

    return {
      ...announcement,
      authorName:
        a.author?.profile?.fullName ||
        a.author?.email ||
        'Sistem',
      authorRegionName: a.author?.profile?.region?.name || null,
      viewCount: a._count?.readBy || 0,
    };
  }

  async read(id: string, userId: string) {
    await this.findOne(id);
    const readRecord = await this.prisma.announcementRead.upsert({
      where: {
        announcementId_userId: {
          announcementId: id,
          userId: userId,
        },
      },
      create: {
        announcementId: id,
        userId: userId,
      },
      update: {
        readAt: new Date(),
      },
    });

    // Also mark as read any explicit Notification record for this announcement
    await this.prisma.notification.updateMany({
      where: {
        userId: userId,
        type: 'ANNOUNCEMENT',
        referenceId: id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return readRecord;
  }

  async publish(id: string) {
    await this.findOne(id);
    return this.announcementRepository.update({ id }, { isPublished: true });
  }

  async unpublish(id: string) {
    await this.findOne(id);
    return this.announcementRepository.update({ id }, { isPublished: false });
  }
}
