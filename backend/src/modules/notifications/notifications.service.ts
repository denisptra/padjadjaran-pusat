import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(currentUser: any) {
    const userId = currentUser.id;

    // Construct scope filters based on user role and profile/region
    const scopeFilters: any[] = [{ scope: 'national' }];

    if (currentUser.role === 'member') {
      const profile = await this.prisma.memberProfile.findUnique({
        where: { userId },
      });
      if (profile && profile.regionId) {
        const region = await this.prisma.region.findUnique({
          where: { id: profile.regionId },
        });
        if (region?.provinceId) {
          scopeFilters.push({
            scope: 'province',
            targetProvinces: { has: region.provinceId },
          });
        }
        scopeFilters.push({
          scope: 'region',
          targetRegions: { has: profile.regionId },
        });
      }
    } else if (currentUser.role === 'admin_wilayah') {
      const region = await this.prisma.region.findUnique({
        where: { adminId: userId },
      });
      if (region) {
        if (region.provinceId) {
          scopeFilters.push({
            scope: 'province',
            targetProvinces: { has: region.provinceId },
          });
        }
        scopeFilters.push({
          scope: 'region',
          targetRegions: { has: region.id },
        });
      }
    }

    const whereAnnouncement: any = {
      isPublished: true,
    };

    if (currentUser.role === 'member' || currentUser.role === 'admin_wilayah') {
      whereAnnouncement.OR = scopeFilters;
    }

    // Query announcements targeted to user
    const announcements = await this.prisma.announcement.findMany({
      where: whereAnnouncement,
      include: {
        readBy: {
          where: { userId },
        },
      },
    });

    // Format unread announcements
    const unreadAnnouncements = announcements
      .filter((a) => a.readBy.length === 0)
      .map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        type: 'ANNOUNCEMENT',
        referenceId: a.id,
        isRead: false,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }));

    // Query DB notifications for user
    const dbNotifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const formattedDbNotifications = dbNotifications.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      type: n.type,
      referenceId: n.referenceId,
      isRead: n.isRead,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));

    // Merge and sort by createdAt descending
    const merged = [...unreadAnnouncements, ...formattedDbNotifications];
    merged.sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());

    return merged;
  }

  async createNotification(
    userId: string,
    title: string,
    content: string,
    type: string,
    referenceId?: string,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        content,
        type,
        referenceId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    // 1. Check if it exists in custom notifications table
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (notification) {
      const updated = await this.prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      // If it was an announcement notification, also mark announcement as read
      if (notification.type === 'ANNOUNCEMENT' && notification.referenceId) {
        await this.prisma.announcementRead.upsert({
          where: {
            announcementId_userId: {
              announcementId: notification.referenceId,
              userId,
            },
          },
          create: {
            announcementId: notification.referenceId,
            userId,
          },
          update: {
            readAt: new Date(),
          },
        });
      }

      return updated;
    }

    // 2. Otherwise, check if it is an announcement and record as read
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (announcement) {
      const readRecord = await this.prisma.announcementRead.upsert({
        where: {
          announcementId_userId: {
            announcementId: id,
            userId,
          },
        },
        create: {
          announcementId: id,
          userId,
        },
        update: {
          readAt: new Date(),
        },
      });

      // Also mark as read any explicit Notification record for this announcement
      await this.prisma.notification.updateMany({
        where: {
          userId,
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

    return { success: false, message: 'Notification or Announcement not found' };
  }

  async markAllAsRead(userId: string) {
    // 1. Mark all DB notifications for this user as read
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    // 2. Mark all targeted unread announcements as read
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!currentUser) return { success: false };

    const scopeFilters: any[] = [{ scope: 'national' }];

    if (currentUser.role === 'member') {
      const profile = await this.prisma.memberProfile.findUnique({
        where: { userId },
      });
      if (profile && profile.regionId) {
        const region = await this.prisma.region.findUnique({
          where: { id: profile.regionId },
        });
        if (region?.provinceId) {
          scopeFilters.push({
            scope: 'province',
            targetProvinces: { has: region.provinceId },
          });
        }
        scopeFilters.push({
          scope: 'region',
          targetRegions: { has: profile.regionId },
        });
      }
    } else if (currentUser.role === 'admin_wilayah') {
      const region = await this.prisma.region.findUnique({
        where: { adminId: userId },
      });
      if (region) {
        if (region.provinceId) {
          scopeFilters.push({
            scope: 'province',
            targetProvinces: { has: region.provinceId },
          });
        }
        scopeFilters.push({
          scope: 'region',
          targetRegions: { has: region.id },
        });
      }
    }

    const whereAnnouncement: any = {
      isPublished: true,
    };
    if (currentUser.role === 'member' || currentUser.role === 'admin_wilayah') {
      whereAnnouncement.OR = scopeFilters;
    }

    const unreadAnnouncements = await this.prisma.announcement.findMany({
      where: {
        ...whereAnnouncement,
        readBy: {
          none: { userId },
        },
      },
      select: { id: true },
    });

    for (const a of unreadAnnouncements) {
      await this.prisma.announcementRead.upsert({
        where: {
          announcementId_userId: {
            announcementId: a.id,
            userId,
          },
        },
        create: {
          announcementId: a.id,
          userId,
        },
        update: {
          readAt: new Date(),
        },
      });
    }

    return { success: true };
  }
}
