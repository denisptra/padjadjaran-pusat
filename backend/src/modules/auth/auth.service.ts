import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import {
  RegisterDto,
  VerifyOtpDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { Role, MemberType, UserStatus } from '@prisma/client';
import { UserRepository } from '../../core/repositories/user.repository';
import { MemberProfileRepository } from '../../core/repositories/member-profile.repository';
import { OtpTokenRepository } from '../../core/repositories/otp-token.repository';
import { RefreshTokenRepository } from '../../core/repositories/refresh-token.repository';
import { PasswordResetTokenRepository } from '../../core/repositories/password-reset-token.repository';
import { PrismaService } from '../../core/prisma/prisma.service';
import { SecurityUtils } from '../../core/utils/security.utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly memberProfileRepository: MemberProfileRepository,
    private readonly otpTokenRepository: OtpTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly securityUtils: SecurityUtils,
  ) {}

  private generateRandomNumericToken(length: number): string {
    let result = '';
    const characters = '0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      if (
        existingUser.status === UserStatus.ACTIVE &&
        existingUser.emailVerifiedAt
      ) {
        throw new BadRequestException(
          'Alamat email ini sudah terdaftar dan aktif. Silakan masuk melalui menu Login.',
        );
      }

      if (!existingUser.emailVerifiedAt) {
        // If user exists but not verified, resend OTP and return success
        // This handles cases where registration was interrupted
        const otp = this.generateRandomNumericToken(6);
        const otpHash = await argon2.hash(otp);

        await this.prisma.$transaction(async (tx) => {
          await tx.otpToken.updateMany({
            where: {
              userId: existingUser.id,
              purpose: 'email_verify',
              consumedAt: null,
            },
            data: { consumedAt: new Date() },
          });

          await tx.otpToken.create({
            data: {
              userId: existingUser.id,
              email: email,
              otpHash,
              purpose: 'email_verify',
              expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            },
          });
          
          // Also update password if provided, in case they want to change it
          const passwordHash = await argon2.hash(dto.password);
          await tx.user.update({
            where: { id: existingUser.id },
            data: { passwordHash }
          });
        });

        await this.emailService.sendOtp(email, otp);
        return {
          message:
            'Email Anda sudah terdaftar tetapi belum diverifikasi. Kode OTP baru telah dikirim.',
          otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        };
      }

      throw new BadRequestException(
        'Email ini sudah terdaftar. Silakan gunakan menu Login untuk masuk.',
      );
    }

    const passwordHash = await argon2.hash(dto.password);
    const otp = this.generateRandomNumericToken(6);
    const otpHash = await argon2.hash(otp);

    const user = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: email,
          passwordHash,
          role: Role.member,
          status: UserStatus.PENDING,
        },
      });

      await tx.memberProfile.create({
        data: {
          userId: u.id,
          fullName: dto.fullName || '',
          nik: dto.nik ? this.securityUtils.encrypt(dto.nik) : '',
          phone: dto.phone || '',
          nationality: dto.nationality || 'WNI',
          memberType: dto.memberType || MemberType.umum,
          registrationStep: 0,
        },
      });

      await tx.otpToken.create({
        data: {
          userId: u.id,
          email: email,
          otpHash,
          purpose: 'email_verify',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
      return u;
    });

    await this.emailService.sendOtp(email, otp);
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      message: 'Registrasi berhasil. Silakan cek email Anda untuk kode verifikasi.',
      state: 'EMAIL_NOT_VERIFIED',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: dto.fullName || '',
      },
      registrationStep: 0,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      ...tokens,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const otpRecord = await this.prisma.otpToken.findFirst({
      where: {
        email: email,
        purpose: 'email_verify',
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException(
        'Kode OTP tidak ditemukan atau sudah digunakan.',
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new BadRequestException('Kode OTP sudah kedaluwarsa.');
    }

    if (otpRecord.attemptCount >= 5) {
      throw new BadRequestException(
        'Terlalu banyak percobaan. Silakan minta kode OTP baru.',
      );
    }

    const isValid = await argon2.verify(otpRecord.otpHash, dto.otp);
    if (!isValid) {
      await this.prisma.otpToken.update({
        where: { id: otpRecord.id },
        data: { attemptCount: { increment: 1 } },
      });
      throw new BadRequestException('Kode OTP salah.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.otpToken.update({
        where: { id: otpRecord.id },
        data: { consumedAt: new Date() },
      });
      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt: new Date(),
        },
      });

      // Upsert memberProfile to step 1 (OTP Verified)
      await tx.memberProfile.upsert({
        where: { userId: user.id },
        update: { registrationStep: 1 },
        create: {
          userId: user.id,
          registrationStep: 1,
        },
      });
      
      // Create a pending approval record
      const existingApproval = await tx.approval.findFirst({
        where: { creatorId: user.id, type: 'registration' }
      });
      
      if (!existingApproval) {
        await tx.approval.create({
          data: {
            creatorId: user.id,
            type: 'registration',
            status: 'pending',
            notes: 'Pendaftaran awal (OTP Terverifikasi)',
          }
        });
      }
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      message: 'Email berhasil diverifikasi.',
      ...tokens,
    };
  }

  async resendOtp(dto: { email: string }) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Return generic success to avoid email enumeration
      return { message: 'Jika email terdaftar, kode OTP baru telah dikirim.' };
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email sudah terverifikasi.');
    }

    const otp = this.generateRandomNumericToken(6);
    const otpHash = await argon2.hash(otp);

    await this.prisma.$transaction(async (tx) => {
      // Inactivate old OTPs
      await tx.otpToken.updateMany({
        where: { userId: user.id, purpose: 'email_verify', consumedAt: null },
        data: { consumedAt: new Date() },
      });

      await tx.otpToken.create({
        data: {
          userId: user.id,
          email: email,
          otpHash,
          purpose: 'email_verify',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
    });

    await this.emailService.sendOtp(email, otp);

    return {
      message: 'Kode OTP baru telah dikirimkan ke email Anda.',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(
        'Alamat email tidak ditemukan. Silakan periksa kembali atau lakukan pendaftaran akun baru.',
      );
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Kata sandi yang Anda masukkan salah.');
    }

    // Determine login state
    let state = 'ACTIVE';

    if (user.status === UserStatus.INACTIVE) {
      state = 'INACTIVE';
    } else if (!user.emailVerifiedAt) {
      state = 'EMAIL_NOT_VERIFIED';
    } else if (user.role === Role.member) {
      // Onboarding checks ONLY for members
      const profile = user.profile;
      if (!profile || profile.registrationStep < 4) {
        state = 'PROFILE_INCOMPLETE';
      } else {
        const latestApproval = await this.prisma.approval.findFirst({
          where: {
            creatorId: user.id,
            type: 'registration',
          },
          orderBy: { createdAt: 'desc' },
        });

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

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      message: 'Login berhasil',
      state,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.fullName,
      },
      registrationStep: user.profile?.registrationStep || 0,
      ...tokens,
    };
  }

  async generateTokens(userId: string, email: string, role: string) {
    const rawAccessToken = this.jwtService.sign(
      { sub: userId, email, role },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRATION') ||
          '15m') as any,
      },
    );
    const accessToken = this.securityUtils.encrypt(rawAccessToken);

    const refreshToken = randomBytes(64).toString('hex');
    const refreshTokenHash = await argon2.hash(refreshToken);

    const refreshExpirationDays = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION_DAYS') || '7',
    );
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(
          Date.now() + refreshExpirationDays * 24 * 60 * 60 * 1000,
        ),
      },
    });

    return { accessToken, refreshToken };
  }

  async refresh(oldRefreshToken: string) {
    if (!oldRefreshToken) throw new UnauthorizedException();

    const tokenRecords = await this.prisma.refreshToken.findMany({
      where: { isRevoked: false, expiresAt: { gt: new Date() } },
      include: { user: { include: { profile: true } } },
    });

    let matchedRecord: any = null;
    for (const record of tokenRecords) {
      if (await argon2.verify(record.tokenHash, oldRefreshToken)) {
        matchedRecord = record;
        break;
      }
    }

    if (!matchedRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = matchedRecord.user;
    if (user.status === UserStatus.INACTIVE)
      throw new UnauthorizedException('Account inactive');

    await this.prisma.refreshToken.update({
      where: { id: matchedRecord.id },
      data: { isRevoked: true },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    const tokenRecords = await this.prisma.refreshToken.findMany({
      where: { isRevoked: false },
    });
    for (const record of tokenRecords) {
      if (await argon2.verify(record.tokenHash, refreshToken)) {
        await this.prisma.refreshToken.update({
          where: { id: record.id },
          data: { isRevoked: true },
        });
        break;
      }
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findByEmail(
      dto.email.toLowerCase().trim(),
    );
    if (!user) {
      throw new NotFoundException(
        'Alamat email tidak ditemukan dalam sistem kami.',
      );
    }

    const resetToken = randomBytes(32).toString('hex');
    const tokenHash = await argon2.hash(resetToken);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await this.emailService.sendPasswordReset(user.email, resetToken);
    return {
      message: 'Tautan pemulihan kata sandi telah dikirim ke email Anda.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepository.findByEmail(
      dto.email.toLowerCase().trim(),
    );
    if (!user) throw new BadRequestException('Alamat email tidak ditemukan. Silakan periksa kembali.');

    const tokenRecords = await this.passwordResetTokenRepository.findAll({
      where: {
        userId: user.id,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    let matchedRecord = null;
    for (const record of tokenRecords) {
      if (await argon2.verify(record.tokenHash, dto.token)) {
        matchedRecord = record;
        break;
      }
    }

    if (!matchedRecord)
      throw new BadRequestException('Tautan reset kata sandi sudah kedaluwarsa atau tidak valid.');

    const passwordHash = await argon2.hash(dto.newPassword);

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.update({
        where: { id: matchedRecord.id },
        data: { consumedAt: new Date() },
      });
      await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
      // Revoke all sessions
      await tx.refreshToken.updateMany({
        where: { userId: user.id, isRevoked: false },
        data: { isRevoked: true },
      });
    });

    return { message: 'Kata sandi berhasil diubah. Silakan masuk dengan kata sandi baru Anda.' };
  }

  async getRegistrationPaymentSettings() {
    const setting = await this.prisma.paymentSetting.findFirst({
      where: { type: 'REGISTRATION', isActive: true },
    });
    if (!setting) {
      return {
        amount: 150000,
        bankName: 'BCA',
        accountNumber: '1234567890',
        accountOwner: 'PPS PADJADJARAN PUSAT',
        whatsapp: '6281234567890',
        instruction:
          'Transfer ke rekening BCA di atas, simpan bukti transfer dan kirimkan konfirmasi via WhatsApp.',
      };
    }
    return setting;
  }
}
