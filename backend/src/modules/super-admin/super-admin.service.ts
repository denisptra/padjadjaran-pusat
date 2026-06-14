import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../core/repositories/user.repository';
import { ActionMatrixRepository } from '../../core/repositories/action-matrix.repository';
import { FeatureControlRepository } from '../../core/repositories/feature-control.repository';
import { AuditLogRepository } from '../../core/repositories/audit-log.repository';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserStatus, Role, Prisma } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { join } from 'path';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'fs';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly actionMatrixRepository: ActionMatrixRepository,
    private readonly featureControlRepository: FeatureControlRepository,
    private readonly auditLogRepository: AuditLogRepository,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async findAllUsers(query: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const where: Prisma.UserWhereInput = search
      ? { email: { contains: search, mode: 'insensitive' } }
      : {};

    return this.userRepository.paginate({
      where,
      page,
      limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      include: { profile: true },
    });
  }

  async activateUser(id: string) {
    const user = await this.userRepository.findOne({ id });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return this.userRepository.update({ id }, { status: UserStatus.ACTIVE });
  }

  async deactivateUser(id: string) {
    const user = await this.userRepository.findOne({ id });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return this.userRepository.update({ id }, { status: UserStatus.INACTIVE });
  }

  async getAuditLogs(query: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const where: Prisma.AuditLogWhereInput = search
      ? { action: { contains: search, mode: 'insensitive' } }
      : {};

    return this.auditLogRepository.paginate({
      where,
      page,
      limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      include: { user: true },
    });
  }

  async getActionMatrix() {
    return this.actionMatrixRepository.findAll({});
  }

  async updateActionMatrix(role: Role, action: string, isAllowed: boolean) {
    return this.actionMatrixRepository.model.upsert({
      where: { role_action: { role, action } },
      update: { isAllowed },
      create: { role, action, isAllowed },
    });
  }

  async getFeatureControl() {
    return this.featureControlRepository.findAll({});
  }

  async updateFeatureControl(key: string, isEnabled: boolean) {
    return this.featureControlRepository.model.upsert({
      where: { key },
      update: { isEnabled },
      create: { key, isEnabled },
    });
  }

  async startImpersonate(targetUserId: string) {
    const targetUser = await this.userRepository.findOne(
      { id: targetUserId },
      { profile: true },
    );
    if (!targetUser) {
      throw new NotFoundException('User target tidak ditemukan');
    }
    const tokens = await this.authService.generateTokens(
      targetUser.id,
      targetUser.email,
      targetUser.role,
    );

    const profile = (targetUser as any).profile as
      | { fullName?: string }
      | null
      | undefined;

    return {
      tokens,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        fullName: profile?.fullName || '',
      },
    };
  }

  getBackups() {
    const backupDir = join(process.cwd(), 'backups');
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    const files = readdirSync(backupDir);
    return files
      .filter((file) => file.endsWith('.json') || file.endsWith('.sql'))
      .map((file) => {
        const filePath = join(backupDir, file);
        const stats = statSync(filePath);
        return {
          filePath: file,
          triggeredBy: 'Super Admin',
          createdAt: stats.birthtime,
          status: 'Berhasil',
          size: stats.size,
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createBackup() {
    const backupDir = join(process.cwd(), 'backups');
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    const tables = {
      users: await this.prisma.user.findMany({ include: { profile: true } }),
      actionMatrix: await this.prisma.actionMatrix.findMany({}),
      featureControl: await this.prisma.featureControl.findMany({}),
      systemSettings: await this.prisma.systemSetting.findMany({}),
      regions: await this.prisma.region.findMany({}),
      provinces: await this.prisma.province.findMany({}),
      announcements: await this.prisma.announcement.findMany({}),
      approvals: await this.prisma.approval.findMany({}),
      payments: await this.prisma.payment.findMany({}),
    };

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, 19);
    const filename = `backup_${timestamp}.json`;
    const filePath = join(backupDir, filename);

    writeFileSync(filePath, JSON.stringify(tables, null, 2), 'utf-8');
    return { filename, size: statSync(filePath).size };
  }

  async getSystemSettings() {
    const settings = await this.prisma.systemSetting.findMany({});
    const config: Record<string, string> = {};
    settings.forEach((s) => {
      config[s.key] = s.value;
    });
    return {
      appName: config.appName || 'PPS Padjadjaran Portal',
      maintenanceMode: config.maintenanceMode === 'true',
      sessionTimeout: config.sessionTimeout || '60',
      emailOtp: config.emailOtp !== 'false',
      loginAttempts: config.loginAttempts || '5',
      supportContact: config.supportContact || '0812-3456-7890',
    };
  }

  async updateSystemSettings(data: Record<string, string | boolean>) {
    const promises = Object.entries(data).map(([key, value]) => {
      const valueStr = String(value);
      return this.prisma.systemSetting.upsert({
        where: { key },
        update: { value: valueStr },
        create: { key, value: valueStr },
      });
    });
    await Promise.all(promises);
    return this.getSystemSettings();
  }
}
