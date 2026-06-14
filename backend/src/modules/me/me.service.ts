import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UserRepository } from '../../core/repositories/user.repository';
import { MemberProfileRepository } from '../../core/repositories/member-profile.repository';
import { SecurityUtils } from '../../core/utils/security.utils';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class MeService {
  private readonly logger = new Logger(MeService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly memberRepository: MemberProfileRepository,
    private readonly securityUtils: SecurityUtils,
    private readonly prisma: PrismaService,
  ) {}

  async getMe(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user) {
        throw new NotFoundException('Akun tidak ditemukan.');
      }

      let detailedProfile = null;
      if (user.profile) {
        detailedProfile = await this.prisma.memberProfile.findUnique({
          where: { id: user.profile.id },
          include: {
            region: {
              include: {
                province: true,
              },
            },
          },
        });
      }

      const profile = detailedProfile || user.profile || ({} as any);

      const userResponse: any = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      };

      const profileResponse: any = {
        ...profile,
        nationality: profile.nationality || 'WNI',
        avatarUrl: profile.photoUrl || null,
        recommendationUrl: profile.documentUrl || null,
      };
      if (profileResponse.nik) {
        try {
          if (profileResponse.nik.includes(':')) {
            profileResponse.nik = this.securityUtils.decrypt(
              profileResponse.nik,
            );
          }
        } catch (e) {
          this.logger.warn(
            `NIK Decryption failed for user ${userId}: ${e.message}`,
          );
        }
      }

      const latestApproval = await this.prisma.approval.findFirst({
        where: { creatorId: userId, type: 'registration' },
        orderBy: { createdAt: 'desc' },
      });

      const isApproved = !!(latestApproval && latestApproval.status === 'approved');
      const registrationStep = profileResponse.registrationStep || 0;

      // Determine string status for frontend compatibility
      let displayStatus = 'pending';

      if (user.status === UserStatus.ACTIVE) {
        displayStatus = 'active'; // Account is fully active (approved)
      } else if (user.status === UserStatus.PENDING) {
        if (!user.emailVerifiedAt) {
          displayStatus = 'unverified'; // Email not verified yet
        } else if (registrationStep < 4) {
          displayStatus = 'pending'; // Email verified, but profile/docs/payment incomplete
        } else {
          displayStatus = 'pending_approval'; // Everything done, waiting for admin
        }
      } else {
        displayStatus = 'inactive';
      }

      // Determine login/registration state
      let state = 'ACTIVE';

      if (user.status === UserStatus.INACTIVE) {
        state = 'INACTIVE';
      } else if (!user.emailVerifiedAt) {
        state = 'EMAIL_NOT_VERIFIED';
      } else if (user.role === 'member') {
        if (registrationStep < 4) {
          state = 'PROFILE_INCOMPLETE';
        } else {
          if (!latestApproval) {
            state = 'WAITING_APPROVAL';
          } else if (latestApproval.status === 'approved') {
            state = 'ACTIVE';
          } else if (latestApproval.status === 'revision') {
            state = 'REVISION_REQUIRED';
          } else if (latestApproval.status === 'rejected') {
            state = 'REJECTED';
          } else {
            state = 'WAITING_APPROVAL';
          }
        }
      }

      return {
        ...profileResponse,
        ...userResponse,
        province: profile.region?.province?.name || null,
        city: profile.region?.name || null,
        id: user.id,
        isApproved,
        registrationStep,
        displayStatus,
        state,
      };
    } catch (error) {
      this.logger.error(
        `CRITICAL: getMe failed for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updatePassword(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await argon2.verify(user.passwordHash, dto.oldPassword);
    if (!isMatch) throw new BadRequestException('Kata sandi lama tidak sesuai');

    const passwordHash = await argon2.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { success: true };
  }

  async getKta(userId: string) {
    return { ktaUrl: `/files/kta/${userId}.pdf` };
  }
}
