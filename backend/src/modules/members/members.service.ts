import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { MemberProfileRepository } from '../../core/repositories/member-profile.repository';
import { UserRepository } from '../../core/repositories/user.repository';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SecurityUtils } from '../../core/utils/security.utils';
import { Role, UserStatus, MemberType } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as argon2 from 'argon2';

@Injectable()
export class MembersService {
  constructor(
    private readonly memberRepository: MemberProfileRepository,
    private readonly userRepository: UserRepository,
    private readonly securityUtils: SecurityUtils,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(query: any, currentUser: any, status?: string) {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      regionId,
      memberType,
      gender,
      registrationStep,
    } = query;

    const where: any = {
      user: { role: { in: [Role.member, Role.admin_wilayah, Role.admin_pusat] } },
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { ktaNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      const upperStatus = status.toUpperCase();
      if (upperStatus.includes(',')) {
        where.user = {
          ...where.user,
          status: { in: upperStatus.split(',') as UserStatus[] },
        };
      } else {
        where.user = { ...where.user, status: upperStatus as UserStatus };
      }
    }

    if (query.nationality) where.nationality = query.nationality;
    if (memberType) where.memberType = memberType;
    if (gender) where.gender = gender;
    if (regionId) where.regionId = regionId;
    if (registrationStep !== undefined)
      where.registrationStep = Number(registrationStep);

    // Role filtering: admin_wilayah only sees their region
    if (currentUser.role === Role.admin_wilayah) {
      const region = await this.prisma.region.findUnique({
        where: { adminId: currentUser.id },
      });
      if (region?.id) {
        where.regionId = region.id;
      } else {
        return {
          data: [],
          meta: {
            total: 0,
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            totalPages: 0,
          },
        };
      }
    }

    return this.memberRepository
      .paginateMembers({
        where,
        page: Number(page) || 1,
        limit: Number(limit) || 1000,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
        include: { user: true, region: { include: { province: true } } },
      })
      .then((res) => ({
        ...res,
        data: res.data.map((member: any) =>
          this.sanitizeMember(member, currentUser.role, currentUser.id),
        ),
      }));
  }

  async findOne(id: string, currentUser: any) {
    const member = await this.memberRepository.findOne(
      { id },
      { user: true, region: { include: { province: true } } },
    );
    if (!member) throw new NotFoundException('Member not found');

    if (currentUser.role === Role.admin_wilayah) {
      const region = await this.prisma.region.findUnique({
        where: { adminId: currentUser.id },
      });
      if (!region || member.regionId !== region.id) {
        throw new ForbiddenException(
          "You do not have access to this region's members",
        );
      }
    }

    return this.sanitizeMember(member, currentUser.role, currentUser.id);
  }

  async update(id: string, dto: any) {
    const member = await this.memberRepository.findOne({ id }, { user: true });
    if (!member) throw new NotFoundException('Member not found');

    const data: any = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.memberType !== undefined) data.memberType = dto.memberType;
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.nationality !== undefined) data.nationality = dto.nationality;
    if (dto.birthPlace !== undefined) data.birthPlace = dto.birthPlace;
    if (dto.birthDate !== undefined) {
      data.birthDate = (dto.birthDate && !isNaN(Date.parse(dto.birthDate))) ? new Date(dto.birthDate) : null;
    }
    if (dto.nik !== undefined) {
      data.nik = dto.nik ? this.securityUtils.encrypt(dto.nik) : null;
    }
    if (dto.regionId !== undefined) {
      data.regionId = dto.regionId ? dto.regionId : null;
    }
    if (dto.photoUrl !== undefined) data.photoUrl = dto.photoUrl;
    if (dto.documentUrl !== undefined) data.documentUrl = dto.documentUrl;

    // Handle role, email, and status update if provided (Only for admins)
    const userUpdateData: any = {};
    if (dto.role !== undefined) userUpdateData.role = dto.role;
    if (dto.status !== undefined) userUpdateData.status = dto.status;
    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase().trim();
      if (email !== member.user?.email) {
        const existing = await this.userRepository.findByEmail(email);
        if (existing) throw new BadRequestException('Email sudah digunakan oleh akun lain.');
        userUpdateData.email = email;
      }
    }

    if (Object.keys(userUpdateData).length > 0) {
      await this.userRepository.update({ id: member.userId }, userUpdateData);
    }

    return this.memberRepository.update({ id }, data);
  }

  async changeRegion(id: string, regionId: string) {
    const member = await this.memberRepository.findOne({ id });
    if (!member) throw new NotFoundException('Member not found');
    return this.memberRepository.update({ id }, { regionId });
  }

  async assignAdminWilayah(id: string, regionId: string) {
    const member = await this.memberRepository.findOne({ id });
    if (!member) throw new NotFoundException('Member not found');

    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
    });
    if (!region) throw new NotFoundException('Region not found');

    return this.prisma.$transaction(async (tx) => {
      // If region already has an admin, demote them to member role
      if (region.adminId) {
        await tx.user.update({
          where: { id: region.adminId },
          data: { role: Role.member },
        });
      }

      // If user is already an admin of another region, clear that first
      const existingRegion = await tx.region.findUnique({
        where: { adminId: member.userId },
      });
      if (existingRegion) {
        await tx.region.update({
          where: { id: existingRegion.id },
          data: { adminId: null },
        });
      }

      // Update user role to admin_wilayah
      await tx.user.update({
        where: { id: member.userId },
        data: { role: Role.admin_wilayah },
      });

      // Assign user as admin of the region
      return tx.region.update({
        where: { id: regionId },
        data: { adminId: member.userId },
      });
    });
  }

  async revokeAdminWilayah(id: string) {
    const member = await this.memberRepository.findOne({ id });
    if (!member) throw new NotFoundException('Member not found');

    const user = await this.userRepository.findOne({ id: member.userId });
    if (!user || user.role !== Role.admin_wilayah)
      throw new ForbiddenException('User is not an admin wilayah');

    return this.prisma.$transaction(async (tx) => {
      // Demote user role to member
      await tx.user.update({
        where: { id: member.userId },
        data: { role: Role.member },
      });

      // Remove from any region administration
      return tx.region.updateMany({
        where: { adminId: member.userId },
        data: { adminId: null },
      });
    });
  }

  async updateProfile(currentUser: any, dto: any) {
    const userId = currentUser.id;
    const profile = await this.memberRepository.findOne({ userId });

    // Extract only valid MemberProfile fields
    const {
      fullName,
      nik,
      phone,
      gender,
      birthPlace,
      birthDate,
      address,
      nationality,
      regionId,
      photoUrl,
      documentUrl,
      avatarUrl,
      recommendationUrl,
    } = dto;

    const data: any = {};
    const isMember = currentUser.role === Role.member;

    if (fullName !== undefined) data.fullName = fullName;
    if (nationality !== undefined) data.nationality = nationality;

    if (nik !== undefined) {
      data.nik = nik ? this.securityUtils.encrypt(nik) : null;
    }

    if (phone !== undefined) data.phone = phone;
    if (gender !== undefined) data.gender = gender;
    if (birthPlace !== undefined) data.birthPlace = birthPlace;
    if (birthDate !== undefined) {
      data.birthDate = (birthDate && !isNaN(Date.parse(birthDate))) ? new Date(birthDate) : null;
    }
    if (address !== undefined) data.address = address;
    if (regionId !== undefined) {
      data.regionId = regionId ? regionId : null;
    }

    const newPhotoUrl = photoUrl || avatarUrl;
    if (newPhotoUrl !== undefined) data.photoUrl = newPhotoUrl;

    const newDocUrl = documentUrl || recommendationUrl;
    if (newDocUrl !== undefined) data.documentUrl = newDocUrl;

    // Advance registration step:
    // Baseline: Step 1 (OTP Verified)
    // Goal: Step 2 (Biodata Done)
    try {
      if (profile) {
        if (profile.registrationStep < 2) {
          data.registrationStep = 2;
        }
        return await this.memberRepository.update({ id: profile.id }, data);
      } else {
        // Fallback
        return await this.memberRepository.create({
          ...data,
          userId,
          registrationStep: 2,
        });
      }
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new BadRequestException('NIK atau Nomor Telepon sudah terdaftar oleh anggota lain.');
      }
      throw err;
    }
  }

  async uploadDocuments(
    currentUser: any,
    dto: {
      photoUrl?: string;
      avatarUrl?: string;
      documentUrl?: string;
      recommendationUrl?: string;
    },
  ) {
    const userId = currentUser.id;
    const profile = await this.memberRepository.findOne({ userId });

    const photoUrl = dto.photoUrl || dto.avatarUrl;
    const documentUrl = dto.documentUrl || dto.recommendationUrl;

    const updateData: any = {};

    if (photoUrl) updateData.photoUrl = photoUrl;
    if (documentUrl) updateData.documentUrl = documentUrl;

    if (profile) {
      if (profile.registrationStep === 2) {
        updateData.registrationStep = 4;
      }

      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.memberProfile.update({
          where: { id: profile.id },
          data: updateData,
        });

        if (updateData.registrationStep === 4) {
          // Check if approval already exists
          const existing = await tx.approval.findFirst({
            where: { creatorId: userId, type: 'registration' },
          });
          if (!existing) {
            const newApp = await tx.approval.create({
              data: {
                creatorId: userId,
                type: 'registration',
                status: 'pending',
                notes: 'Menunggu peninjauan berkas pendaftaran (Dokumen telah lengkap)',
              },
            });
            await this.notifyAdminsForNewApproval(tx, userId, newApp.id);
          } else if (existing.status === 'pending') {
            await tx.approval.update({
              where: { id: existing.id },
              data: { notes: 'Menunggu peninjauan berkas pendaftaran (Dokumen telah lengkap)' }
            });
            await this.notifyAdminsForNewApproval(tx, userId, existing.id);
          }
        }
        return updated;
      });
    } else {
      return this.prisma.$transaction(async (tx) => {
        const created = await tx.memberProfile.create({
          data: {
            ...updateData,
            userId,
            registrationStep: 4,
          },
        });

        const newApp = await tx.approval.create({
          data: {
            creatorId: userId,
            type: 'registration',
            status: 'pending',
            notes: 'Menunggu peninjauan berkas pendaftaran (Dokumen telah lengkap)',
          },
        });
        await this.notifyAdminsForNewApproval(tx, userId, newApp.id);
        return created;
      });
    }
  }

  private async notifyAdminsForNewApproval(tx: any, userId: string, approvalId: string) {
    try {
      const member = await tx.memberProfile.findUnique({
        where: { userId },
        include: { region: true },
      });
      const memberName = member?.fullName || 'Anggota Baru';
      const notificationTitle = 'Persetujuan Pendaftaran Baru';
      const notificationContent = `Pendaftaran Anggota Baru ${memberName} menunggu persetujuan berkas pendaftaran Anda.`;

      const adminsToNotify = new Set<string>();

      // 1. Central Admins & Super Admins
      const centralAdmins = await tx.user.findMany({
        where: {
          role: { in: ['admin_pusat', 'super_admin'] },
          status: 'ACTIVE',
        },
        select: { id: true },
      });
      centralAdmins.forEach((a: any) => adminsToNotify.add(a.id));

      // 2. Regional Admin (if member has region)
      if (member?.regionId) {
        const region = await tx.region.findUnique({
          where: { id: member.regionId },
          select: { adminId: true },
        });
        if (region?.adminId) {
          adminsToNotify.add(region.adminId);
        }
      }

      // Create notification entries
      for (const adminId of adminsToNotify) {
        await tx.notification.create({
          data: {
            userId: adminId,
            title: notificationTitle,
            content: notificationContent,
            type: 'APPROVAL',
            referenceId: approvalId,
            isRead: false,
          },
        });
      }
    } catch (err) {
      console.error('Failed to notify admins of new approval', err);
    }
  }

  private sanitizeMember(member: any, role: Role, currentUserId?: string) {
    if (!member) return null;
    const m = { ...member };
    // Always hide hashes
    if (m.user) {
      delete m.user.passwordHash;
      delete m.user.refreshTokenHash;
    }

    // Mask/Decrypt based on role or self-access
    const isOwner = currentUserId && m.userId === currentUserId;

    if (role === Role.super_admin || role === Role.admin_pusat || isOwner) {
      // Full access for admins or owner
      if (m.nik && m.nik.includes(':')) {
        try {
          m.nik = this.securityUtils.decrypt(m.nik);
        } catch (e) {
          // Keep as is
        }
      }
    } else {
      // Masked for others
      if (m.nik) m.nik = '****************';
      if (m.phone) m.phone = this.securityUtils.maskPhone(m.phone);
    }

    // Add flattened fields for easier access
    m.province = m.region?.province?.name || null;
    m.city = m.region?.name || null;

    return m;
  }

  async activate(id: string) {
    const member = await this.memberRepository.findOne({ id });
    if (!member) throw new NotFoundException('Member not found');
    return this.userRepository.update(
      { id: member.userId },
      { status: UserStatus.ACTIVE },
    );
  }

  async deactivate(id: string) {
    const member = await this.memberRepository.findOne({ id });
    if (!member) throw new NotFoundException('Member not found');
    return this.userRepository.update(
      { id: member.userId },
      { status: UserStatus.INACTIVE },
    );
  }

  async reject(id: string) {
    const member = await this.memberRepository.findOne({ id });
    if (!member) throw new NotFoundException('Member not found');
    return this.userRepository.update(
      { id: member.userId },
      { status: UserStatus.INACTIVE },
    );
  }

  async bulkAction(ids: string[], action: string) {
    for (const id of ids) {
      const member = await this.memberRepository.findOne({ id });
      if (member) {
        if (action === 'activate') {
          await this.userRepository.update(
            { id: member.userId },
            { status: UserStatus.ACTIVE },
          );
        } else if (action === 'deactivate') {
          await this.userRepository.update(
            { id: member.userId },
            { status: UserStatus.INACTIVE },
          );
        } else if (action === 'delete') {
          await this.memberRepository.delete({ id: member.id });
          await this.userRepository.delete({ id: member.userId });
        }
      }
    }
    return { success: true };
  }

  async create(dto: any, currentUser?: any) {
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar.');
    }

    const passwordHash = await argon2.hash(dto.password || 'Padjadjaran123');

    // Role filtering: admin_wilayah only creates members in their region
    let targetRegionId = dto.regionId;
    if (currentUser?.role === Role.admin_wilayah) {
      const region = await this.prisma.region.findUnique({
        where: { adminId: currentUser.id },
      });
      if (!region) throw new ForbiddenException('Admin wilayah tidak memiliki wilayah yang dikelola.');
      targetRegionId = region.id;
    }

    // Create user and profile in transaction
    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            email,
            passwordHash,
            role: Role.member,
            status:
              dto.status === 'inactive' ? UserStatus.INACTIVE : UserStatus.ACTIVE,
            emailVerifiedAt: new Date(),
          },
        });

        const encryptedNik = dto.nik ? this.securityUtils.encrypt(dto.nik) : null;

        const year = new Date().getFullYear().toString();
        
        // Type Codes based on requirement: Khusus=01, Pencak Silat=02, Umum=03
        let typeCode = '03'; // Default Umum
        if (dto.memberType === 'khusus') typeCode = '01';
        else if (dto.memberType === 'pencak_silat') typeCode = '02';

        // Nationality Code: WNI=1, WNA=2
        const natCode = dto.nationality === 'WNA' ? '2' : '1';

        const prefix = `${year}${typeCode}${natCode}`;

        // Find the latest KTA for this prefix
        const latestMember = await tx.memberProfile.findFirst({
          where: {
            ktaNumber: {
              startsWith: prefix,
            },
          },
          orderBy: {
            ktaNumber: 'desc',
          },
          select: {
            ktaNumber: true,
          },
        });

        let nextSequenceNumber = 1;
        if (latestMember && latestMember.ktaNumber) {
          const lastSequenceStr = latestMember.ktaNumber.substring(prefix.length);
          const lastSequence = parseInt(lastSequenceStr, 10);
          if (!isNaN(lastSequence)) {
            nextSequenceNumber = lastSequence + 1;
          }
        }

        const orderStr = nextSequenceNumber.toString().padStart(4, '0');
        const ktaNumber = `${prefix}${orderStr}`;

        let mType: MemberType = MemberType.umum;
        if (dto.memberType === 'khusus') mType = MemberType.khusus;
        else if (dto.memberType === 'pencak_silat')
          mType = MemberType.pencak_silat;

        await tx.memberProfile.create({
          data: {
            userId: u.id,
            fullName: dto.fullName,
            nik: encryptedNik,
            phone: dto.phone || null,
            memberType: mType,
            gender: dto.gender || null,
            nationality: dto.nationality || 'WNI',
            birthPlace: dto.birthPlace || null,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
            address: dto.address || null,
            regionId: targetRegionId || null,
            photoUrl: dto.photoUrl || null,
            documentUrl: dto.documentUrl || null,
            ktaNumber,
            registrationStep: 4, // Fully complete
          },
        });

        // Create approved approval if active
        if (dto.status !== 'inactive') {
          await tx.approval.create({
            data: {
              creatorId: u.id,
              type: 'registration',
              status: 'approved',
              notes: currentUser?.role === Role.admin_wilayah ? `Dibuat oleh Admin Wilayah` : 'Dibuat langsung oleh Admin Pusat',
            },
          });
        }

        return u;
      });

      return user;
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new BadRequestException('NIK atau Nomor Telepon sudah terdaftar oleh anggota lain.');
      }
      throw err;
    }
  }
}
