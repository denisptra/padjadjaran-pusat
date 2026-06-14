import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../core/repositories/user.repository';
import { MemberProfileRepository } from '../../core/repositories/member-profile.repository';
import { RegionRepository } from '../../core/repositories/region.repository';
import { ApprovalRepository } from '../../core/repositories/approval.repository';
import { Role, UserStatus, PublicationType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly memberRepository: MemberProfileRepository,
    private readonly regionRepository: RegionRepository,
    private readonly approvalRepository: ApprovalRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getSummary(currentUser: any, filterRegionName?: string) {
    let summary: any;
    if (currentUser.role === Role.super_admin) {
      summary = await this.getSuperAdminSummary();
    } else if (currentUser.role === Role.admin_pusat) {
      summary = await this.getAdminPusatSummary(filterRegionName);
    } else if (currentUser.role === Role.admin_wilayah) {
      summary = await this.getAdminWilayahSummary(currentUser.id);
    } else {
      summary = await this.getMemberSummary(currentUser.id);
    }

    if (currentUser.role !== Role.super_admin) {
      const popup = await this.getActivePopup(currentUser.id, currentUser.role);
      summary.popupAnnouncement = popup;
    }

    return summary;
  }

  private async getSuperAdminSummary() {
    const [totalUsers, totalRegions, activeUsers, recentNews, recentGallery] =
      await Promise.all([
        this.userRepository.count(),
        this.regionRepository.count(),
        this.userRepository.count({ status: UserStatus.ACTIVE }),
        this.prisma.cmsPublication.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.cmsGallery.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
        }),
      ]);
    return { totalUsers, totalRegions, activeUsers, recentNews, recentGallery };
  }

  private async getAdminPusatSummary(filterRegionName?: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const regionFilter = filterRegionName && filterRegionName !== 'all' ? { region: { name: filterRegionName } } : {};
    const approvalRegionFilter = filterRegionName && filterRegionName !== 'all' ? { creator: { profile: { region: { name: filterRegionName } } } } : {};

    const [
      activeMembers,
      inactiveMembers,
      pendingMembers,
      newRegistrants,
      incompleteMembers,
      pendingApprovals,
      pendingPayments,
      totalRegions,
      regionsWithoutAdmin,
      totalAdminWilayah,
      activeAnnouncements,
      activeNews,
      activeArticles,
      activeGallery,
      activeSliders,
      recentAnnouncements,
      pageViewsToday,
      pageViewsMonth,
      topNews,
      topArticles,
      membersPerRegionAll,
      memberTypeRaw,
      approvalStatusRaw,
      activeStatusRaw,
      // Helper data for loops below
      ...extraData
    ] = await Promise.all([
      this.prisma.memberProfile.count({ where: { user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] }, status: UserStatus.ACTIVE }, ...regionFilter } }),
      this.prisma.memberProfile.count({ where: { user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] }, status: UserStatus.INACTIVE }, ...regionFilter } }),
      this.prisma.memberProfile.count({ where: { user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] }, status: UserStatus.PENDING }, ...regionFilter } }),
      this.prisma.memberProfile.count({ where: { user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] } }, createdAt: { gte: thirtyDaysAgo }, ...regionFilter } }),
      this.prisma.memberProfile.count({ where: { user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] } }, registrationStep: { lt: 4 }, ...regionFilter } }),
      this.prisma.approval.count({ where: { status: 'pending', type: 'registration', ...approvalRegionFilter } }),
      this.prisma.payment.count({ where: { status: 'pending', user: { profile: { ...regionFilter } } } }),
      this.regionRepository.count(),
      this.prisma.region.count({ where: { adminId: null } }),
      this.userRepository.count({ role: Role.admin_wilayah }),
      this.prisma.announcement.count({ where: { isPublished: true } }),
      this.prisma.cmsPublication.count({ where: { isPublished: true, type: PublicationType.BERITA } }),
      this.prisma.cmsPublication.count({ where: { isPublished: true, type: PublicationType.ARTIKEL } }),
      this.prisma.cmsGallery.count({ where: { isActive: true } }),
      this.prisma.cmsHeroSlider.count({ where: { isActive: true } }),
      this.prisma.announcement.findMany({
        where: { isPublished: true },
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pageView.count({
        where: { visitedAt: { gte: new Date(new Date().setHours(0,0,0,0)) } }
      }),
      this.prisma.pageView.count({
        where: { visitedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
      }),
      this.prisma.cmsPublication.findMany({
        where: { isPublished: true, type: PublicationType.BERITA },
        take: 2,
        orderBy: { viewCount: 'desc' },
        select: { title: true, viewCount: true },
      }),
      this.prisma.cmsPublication.findMany({
        where: { isPublished: true, type: PublicationType.ARTIKEL },
        take: 2,
        orderBy: { viewCount: 'desc' },
        select: { title: true, viewCount: true },
      }),
      this.prisma.region.findMany({
        where: { isActive: true },
        select: {
          name: true,
          members: {
            where: {
              user: {
                role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] },
                status: { in: [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.PENDING] },
              },
            },
            select: { id: true },
          },
        },
      }),
      this.prisma.memberProfile.groupBy({
        where: {
          user: {
            role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] },
          },
          ...regionFilter,
        },
        by: ['memberType'],
        _count: { id: true },
      }),
      this.prisma.approval.groupBy({
        where: { ...approvalRegionFilter },
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.user.groupBy({
        where: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] }, profile: { ...regionFilter } },
        by: ['status'],
        _count: { id: true },
      }),
      // Member Growth (last 6 months)
      ...[5, 4, 3, 2, 1, 0].map(i => {
        const start = new Date();
        start.setMonth(start.getMonth() - i);
        start.setDate(1); start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        return this.prisma.memberProfile.count({
          where: {
            user: {
              role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] },
            },
            createdAt: { gte: start, lt: end },
            ...regionFilter,
          },
        });
      }),
      // Page View Trends (last 7 days)
      ...[6, 5, 4, 3, 2, 1, 0].map(i => {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
        const nextD = new Date(d); nextD.setDate(nextD.getDate() + 1);
        return this.prisma.pageView.count({ where: { visitedAt: { gte: d, lt: nextD } } });
      }),
      // News View Trends (last 7 days)
      ...[6, 5, 4, 3, 2, 1, 0].map(i => {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
        const nextD = new Date(d); nextD.setDate(nextD.getDate() + 1);
        return this.prisma.contentView.count({ where: { contentType: 'PUBLICATION', visitedAt: { gte: d, lt: nextD } } });
      }),
      // Gender Distribution for Admin Pusat
      this.prisma.memberProfile.groupBy({
        where: {
          user: {
            role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] },
          },
          ...regionFilter,
        },
        by: ['gender'],
        _count: { id: true },
      }),
    ]);

    // Map extraData back to respective charts
    const growthCounts = extraData.slice(0, 6);
    const growthData = [5, 4, 3, 2, 1, 0].map((i, idx) => {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      return { month: d.toLocaleString('default', { month: 'short' }), count: growthCounts[idx] };
    });

    const trendCounts = extraData.slice(6, 13);
    const pageViewTrends = [6, 5, 4, 3, 2, 1, 0].map((i, idx) => {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      return { date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), count: trendCounts[idx] };
    });

    const newsTrendCounts = extraData.slice(13, 20);
    const newsViewTrends = [6, 5, 4, 3, 2, 1, 0].map((i, idx) => {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      return { date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), count: newsTrendCounts[idx] };
    });

    const genderRaw = extraData[20];

    const totalMembers = activeMembers + pendingMembers;

    return {
      stats: {
        totalMembers,
        activeMembers,
        inactiveMembers,
        pendingMembers,
        newRegistrants,
        incompleteMembers,
        pendingApprovals,
        pendingPayments,
        totalRegions,
        regionsWithoutAdmin,
        totalAdminWilayah,
        activeAnnouncements,
        activeContent: activeNews + activeArticles + activeGallery + activeSliders,
        pageViewsToday,
        pageViewsMonth,
        ktaExpiringSoon: 0,
      },
      charts: {
        memberGrowth: growthData,
        membersPerRegion: membersPerRegionAll
          .map((r: any) => ({ name: r.name, count: r.members.length }))
          .sort((a: any, b: any) => b.count - a.count),
        gender: (genderRaw as any[] || []).map((r: any) => ({
          name: r.gender === 'Laki-laki' ? 'Laki-laki' : r.gender === 'Perempuan' ? 'Perempuan' : 'Lainnya',
          value: r._count.id,
          color: r.gender === 'Laki-laki' ? '#3B82F6' : r.gender === 'Perempuan' ? '#F472B6' : '#9CA3AF',
        })),
        pageViewTrends,
        newsViewTrends,
        topNews,
        topArticles,
        memberTypeDist: memberTypeRaw.map((r: any) => ({ type: r.memberType, count: r._count.id })),
        approvalStatusDist: approvalStatusRaw.map((r: any) => ({ name: r.status, count: r._count.id })),
        activeStatusDist: activeStatusRaw.map((r: any) => ({ name: r.status, count: r._count.id })),
        cmsContentDist: [
          { type: 'News', count: activeNews },
          { type: 'Articles', count: activeArticles },
          { type: 'Gallery', count: activeGallery },
          { type: 'Hero Slider', count: activeSliders },
        ],
        recentAnnouncements,
      },
    };
  }

  private async getAdminWilayahSummary(userId: string) {
    const region = await this.prisma.region.findUnique({
      where: { adminId: userId },
    });
    const regionId = region?.id;

    if (!regionId) {
      return { stats: {}, charts: {}, recentMembers: [], region: null };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      activeMembers,
      inactiveMembers,
      pendingMembers,
      incompleteMembers,
      newRegistrants,
      pendingApprovals,
      pendingPayments,
      activeAnnouncements,
      recentMembers,
      recentAnnouncements,
      genderRaw,
      memberTypeRaw,
      activeStatusRaw,
      approvalStatusRaw,
      // Helper data for loops below
      ...growthCounts
    ] = await Promise.all([
      this.prisma.memberProfile.count({
        where: { regionId, user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] }, status: UserStatus.ACTIVE } },
      }),
      this.prisma.memberProfile.count({
        where: { regionId, user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] }, status: UserStatus.INACTIVE } },
      }),
      this.prisma.memberProfile.count({
        where: { regionId, user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] }, status: UserStatus.PENDING } },
      }),
      this.prisma.memberProfile.count({
        where: { regionId, user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] } }, registrationStep: { lt: 4 } },
      }),
      this.prisma.memberProfile.count({
        where: { regionId, user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] } }, createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.approval.count({
        where: { status: 'pending', type: 'registration', creator: { profile: { regionId } } },
      }),
      this.prisma.payment.count({
        where: { status: 'pending', user: { profile: { regionId } } },
      }),
      this.prisma.announcement.count({
        where: {
          isPublished: true,
          OR: [
            { scope: 'national' },
            { scope: 'region', targetRegions: { has: regionId } },
          ],
        },
      }),
      this.prisma.memberProfile.findMany({
        where: { regionId, user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] } } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, status: true, role: true } } },
      }),
      this.prisma.announcement.findMany({
        where: {
          isPublished: true,
          OR: [
            { scope: 'national' },
            { scope: 'region', targetRegions: { has: regionId } },
          ],
        },
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.memberProfile.groupBy({
        where: {
          regionId,
          user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] } },
        },
        by: ['gender'],
        _count: { id: true },
      }),
      this.prisma.memberProfile.groupBy({
        where: {
          regionId,
          user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] } },
        },
        by: ['memberType'],
        _count: { id: true },
      }),
      this.prisma.user.groupBy({
        where: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] }, profile: { regionId } },
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.approval.groupBy({
        where: { creator: { profile: { regionId } } },
        by: ['status'],
        _count: { id: true },
      }),
      // Member Growth (last 6 months in region)
      ...[5, 4, 3, 2, 1, 0].map(i => {
        const start = new Date();
        start.setMonth(start.getMonth() - i);
        start.setDate(1); start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        return this.prisma.memberProfile.count({
          where: {
            regionId,
            user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] } },
            createdAt: { gte: start, lt: end },
          },
        });
      }),
    ]);

    const growthData = [5, 4, 3, 2, 1, 0].map((i, idx) => {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      return { month: d.toLocaleString('default', { month: 'short' }), count: growthCounts[idx] };
    });

    const totalMembers = activeMembers + pendingMembers;

    return {
      stats: {
        totalMembers,
        activeMembers,
        inactiveMembers,
        pendingMembers,
        incompleteMembers,
        newRegistrants,
        pendingApprovals,
        pendingPayments,
        activeAnnouncements,
        ktaExpiringSoon: 0,
      },
      charts: {
        memberGrowth: growthData,
        gender: genderRaw.map((r) => ({
          name: r.gender === 'Laki-laki' ? 'Laki-laki' : r.gender === 'Perempuan' ? 'Perempuan' : 'Lainnya',
          value: r._count.id,
          color: r.gender === 'Laki-laki' ? '#3B82F6' : r.gender === 'Perempuan' ? '#F472B6' : '#9CA3AF',
        })),
        memberTypeDist: memberTypeRaw.map((r) => {
          const type = r.memberType?.toLowerCase() || '';
          let name = 'Umum';
          let color = '#000000';
          if (type.includes('khusus')) {
            name = 'Khusus';
            color = '#DCAF01';
          } else if (type.includes('pencak') || type.includes('silat')) {
            name = 'Pencak Silat';
            color = '#EF4444';
          }
          return { name, value: r._count.id, color };
        }),
        activeStatusDist: activeStatusRaw.map((r) => ({
          name: r.status === UserStatus.ACTIVE ? 'Aktif' : 'Non-aktif',
          value: r._count.id,
          color: r.status === UserStatus.ACTIVE ? '#10B981' : '#EF4444',
        })),
        approvalStatusDist: approvalStatusRaw.map((r) => ({
          name: r.status === 'approved' ? 'Disetujui' : r.status === 'pending' ? 'Menunggu' : r.status === 'revision' ? 'Revisi' : 'Ditolak',
          value: r._count.id,
          color: r.status === 'approved' ? '#10B981' : r.status === 'pending' ? '#F59E0B' : r.status === 'revision' ? '#3B82F6' : '#EF4444',
        })),
        recentAnnouncements,
      },
      recentMembers: recentMembers.map((m) => ({
        ...m,
        email: m.user?.email,
        status: m.user?.status,
      })),
      region: { id: region.id, name: region.name },
    };
  }

  private async getMemberSummary(userId: string) {
     const user = await this.userRepository.findOne({ id: userId });
     if (!user) throw new NotFoundException('User not found');
     
     const profile = await this.prisma.memberProfile.findUnique({
       where: { userId },
       include: { region: true }
     });

     const scopeFilters: any[] = [{ scope: 'national' }];
     
     if (profile?.regionId) {
       scopeFilters.push({ scope: 'region', targetRegions: { has: profile.regionId } });
       if (profile.region?.provinceId) {
         scopeFilters.push({ scope: 'province', targetProvinces: { has: profile.region.provinceId } });
       }
     }

     const announcements = await this.prisma.announcement.findMany({
       where: {
         isPublished: true,
         OR: scopeFilters
       },
       include: {
         readBy: {
           where: { userId }
         }
       },
       orderBy: { createdAt: 'desc' },
       take: 5
     });

      return { 
        status: user.status, 
        profile: {
          ...profile,
          regionName: profile?.region?.name || 'Pusat'
        },
        announcements: announcements.map((a: any) => ({
          ...a,
          isRead: a.readBy && a.readBy.length > 0,
        })),
      };
  }

  private async getActivePopup(userId: string, role: string) {
    const scopeFilters: any[] = [{ scope: 'national' }];

    if (role === Role.member) {
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
    } else if (role === Role.admin_wilayah) {
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
      showModal: true,
      readBy: {
        none: { userId }
      }
    };

    if (role === Role.member || role === Role.admin_wilayah) {
      whereAnnouncement.OR = scopeFilters;
    }

    return this.prisma.announcement.findFirst({
      where: whereAnnouncement,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      }
    });
  }
}
