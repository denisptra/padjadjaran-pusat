import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { RegionRepository } from '../../core/repositories/region.repository';
import { MemberProfileRepository } from '../../core/repositories/member-profile.repository';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Role, UserStatus } from '@prisma/client';

@Injectable()
export class RegionsService {
  constructor(
    private readonly regionRepository: RegionRepository,
    private readonly memberProfileRepository: MemberProfileRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findProvinces() {
    const count = await this.prisma.province.count();
    if (count < 40) {
      const allProvinces = [
        { name: 'Aceh', isOverseas: false },
        { name: 'Bali', isOverseas: false },
        { name: 'Banten', isOverseas: false },
        { name: 'Bengkulu', isOverseas: false },
        { name: 'DI Yogyakarta', isOverseas: false },
        { name: 'DKI Jakarta', isOverseas: false },
        { name: 'Gorontalo', isOverseas: false },
        { name: 'Jambi', isOverseas: false },
        { name: 'Jawa Barat', isOverseas: false },
        { name: 'Jawa Tengah', isOverseas: false },
        { name: 'Jawa Timur', isOverseas: false },
        { name: 'Kalimantan Barat', isOverseas: false },
        { name: 'Kalimantan Selatan', isOverseas: false },
        { name: 'Kalimantan Tengah', isOverseas: false },
        { name: 'Kalimantan Timur', isOverseas: false },
        { name: 'Kalimantan Utara', isOverseas: false },
        { name: 'Kepulauan Bangka Belitung', isOverseas: false },
        { name: 'Kepulauan Riau', isOverseas: false },
        { name: 'Lampung', isOverseas: false },
        { name: 'Maluku', isOverseas: false },
        { name: 'Maluku Utara', isOverseas: false },
        { name: 'Nusa Tenggara Barat', isOverseas: false },
        { name: 'Nusa Tenggara Timur', isOverseas: false },
        { name: 'Papua', isOverseas: false },
        { name: 'Papua Barat', isOverseas: false },
        { name: 'Papua Barat Daya', isOverseas: false },
        { name: 'Papua Pegunungan', isOverseas: false },
        { name: 'Papua Selatan', isOverseas: false },
        { name: 'Papua Tengah', isOverseas: false },
        { name: 'Riau', isOverseas: false },
        { name: 'Sulawesi Barat', isOverseas: false },
        { name: 'Sulawesi Selatan', isOverseas: false },
        { name: 'Sulawesi Tengah', isOverseas: false },
        { name: 'Sulawesi Tenggara', isOverseas: false },
        { name: 'Sulawesi Utara', isOverseas: false },
        { name: 'Sumatera Barat', isOverseas: false },
        { name: 'Sumatera Selatan', isOverseas: false },
        { name: 'Sumatera Utara', isOverseas: false },
        { name: 'Luar Negeri', isOverseas: true },
        { name: 'Pusat', isOverseas: false },
      ];

      for (const prov of allProvinces) {
        await this.prisma.province.upsert({
          where: { name: prov.name },
          update: { isOverseas: prov.isOverseas },
          create: { name: prov.name, isOverseas: prov.isOverseas },
        });
      }
    }

    return this.prisma.province.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createProvince(data: { name: string; isOverseas?: boolean }) {
    return this.prisma.province.create({
      data: {
        name: data.name,
        isOverseas: data.isOverseas || false,
      },
    });
  }

  async updateProvince(
    id: string,
    data: { name?: string; isOverseas?: boolean },
  ) {
    return this.prisma.province.update({
      where: { id },
      data,
    });
  }

  async removeProvince(id: string) {
    const regionCount = await this.prisma.region.count({
      where: { provinceId: id },
    });
    if (regionCount > 0) {
      throw new ForbiddenException(
        'Tidak dapat menghapus provinsi yang memiliki wilayah kota/kabupaten.',
      );
    }
    return this.prisma.province.delete({ where: { id } });
  }

  async findActiveList(provinceId?: string) {
    const where: any = { isActive: true };
    if (provinceId) {
      where.provinceId = provinceId;
    }
    return this.regionRepository.findAll({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findAll(query: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = query;

    const where: any = {};
    if (search) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    return this.regionRepository.paginate({
      where,
      page,
      limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      include: {
        admin: { include: { profile: true } },
        province: true,
        _count: { 
          select: { 
            members: {
              where: {
                user: { status: UserStatus.ACTIVE }
              }
            } 
          } 
        },
      },
    });
  }

  async findOne(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: {
        admin: { include: { profile: true } },
        province: true,
        _count: { 
          select: { 
            members: {
              where: {
                user: { status: UserStatus.ACTIVE }
              }
            } 
          } 
        },
      },
    });
    if (!region) {
      throw new NotFoundException(`Region with ID ${id} not found`);
    }
    return region;
  }

  async create(data: { 
    name: string; 
    provinceId: string;
    leaderName?: string;
    phone?: string;
    address?: string;
    description?: string;
  }) {
    return this.regionRepository.create({
      name: data.name,
      provinceId: data.provinceId,
      leaderName: data.leaderName,
      phone: data.phone,
      address: data.address,
      description: data.description,
      isActive: true,
    });
  }

  async update(
    id: string, 
    data: { 
      name?: string; 
      provinceId?: string;
      leaderName?: string;
      phone?: string;
      address?: string;
      description?: string;
      isActive?: boolean;
    }
  ) {
    await this.findOne(id);
    return this.regionRepository.update({ id }, data);
  }

  async activate(id: string) {
    await this.findOne(id);
    return this.regionRepository.update({ id }, { isActive: true });
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.regionRepository.update({ id }, { isActive: false });
  }

  async remove(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      select: { adminId: true }
    });
    
    if (!region) throw new NotFoundException('Region not found');

    return this.prisma.$transaction(async (tx) => {
      // 1. Demote admin to regular member before deleting
      if (region.adminId) {
        await tx.user.update({
          where: { id: region.adminId },
          data: { role: Role.member }
        });
      }

      // 2. Set regionId to null for all members registered in this region
      await tx.memberProfile.updateMany({
        where: { regionId: id },
        data: { regionId: null }
      });

      // 3. Clear the admin association on the region record first
      await tx.region.update({
        where: { id },
        data: { adminId: null }
      });

      // 4. Finally delete the region
      return tx.region.delete({ where: { id } });
    });
  }

  async assignAdmin(id: string, adminId: string) {
    const region = await this.findOne(id);

    // 1. Get the user and their profile to check their current region
    const user = await this.prisma.user.findUnique({
      where: { id: adminId },
      include: { profile: true },
    });

    if (!user) throw new NotFoundException('User not found');

    // ENFORCEMENT: User must be ACTIVE (approved)
    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(
        'Hanya anggota dengan status AKTIF yang dapat diangkat menjadi Admin Wilayah.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Automatically register the user to this region if not already registered
      if (user.profile && user.profile.regionId !== id) {
        await tx.memberProfile.update({
          where: { userId: adminId },
          data: { regionId: id },
        });
      }

      // 1. If region already has an admin, demote them to member
      if (region.adminId && region.adminId !== adminId) {
        await tx.user.update({
          where: { id: region.adminId },
          data: { role: Role.member },
        });
      }

      // 2. If the new admin is already admin of another region, clear that
      const existingRegion = await tx.region.findUnique({ where: { adminId } });
      if (existingRegion && existingRegion.id !== id) {
        await tx.region.update({
          where: { id: existingRegion.id },
          data: { adminId: null },
        });
      }

      // 3. Update user role to admin_wilayah
      await tx.user.update({
        where: { id: adminId },
        data: { role: Role.admin_wilayah },
      });

      // 4. Update the region with the new adminId
      return tx.region.update({ where: { id }, data: { adminId } });
    });
  }

  /**
   * GET /regions/profile - Returns the region managed by the currently logged-in admin_wilayah.
   * Uses Region.adminId (not the member profile's regionId) to ensure strict admin-region binding.
   */
  async getProfile(userId: string) {
    const region = await this.prisma.region.findUnique({
      where: { adminId: userId },
      include: {
        province: true,
        _count: { select: { members: true } },
        admin: { include: { profile: true } },
      },
    });

    if (!region) {
      throw new NotFoundException(
        `No region found for admin user ${userId}. Please ensure this admin is assigned to a region.`,
      );
    }

    return {
      data: region,
    };
  }

  /**
   * PATCH /regions/profile - Admin Wilayah can only update limited fields.
   * Fields like id, name, adminId, isActive are NOT updatable via this endpoint.
   */
  async updateProfile(
    userId: string,
    dto: {
      leaderName?: string;
      phone?: string;
      address?: string;
      description?: string;
    },
  ) {
    const region = await this.prisma.region.findUnique({
      where: { adminId: userId },
    });
    if (!region) {
      throw new NotFoundException(`No region found for admin user ${userId}`);
    }

    const updateData: any = {};
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.leaderName !== undefined) updateData.leaderName = dto.leaderName;
    if (dto.description !== undefined) updateData.description = dto.description;

    await this.prisma.region.update({
      where: { id: region.id },
      data: updateData,
    });

    return this.getProfile(userId);
  }

  async bulkAction(ids: string[], action: string) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('IDs cannot be empty');
    }

    if (action === 'activate') {
      return this.prisma.region.updateMany({
        where: { id: { in: ids } },
        data: { isActive: true },
      });
    } else if (action === 'deactivate') {
      return this.prisma.region.updateMany({
        where: { id: { in: ids } },
        data: { isActive: false },
      });
    } else if (action === 'delete') {
      const results = [];
      for (const id of ids) {
        try {
          const res = await this.remove(id);
          results.push(res);
        } catch (e) {
          // ignore error to allow other deletes to finish
        }
      }
      return { count: results.length };
    } else {
      throw new BadRequestException(`Unknown bulk action: ${action}`);
    }
  }
}
