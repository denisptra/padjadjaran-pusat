import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditAction } from '../../core/decorators/audit-log.decorator';
import type { Request, Response } from 'express';
import { SecurityUtils } from '../../core/utils/security.utils';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../../core/prisma/prisma.service';

interface ImpersonationTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

@ApiTags('super')
@Controller('super')
@ApiBearerAuth()
@Roles(Role.super_admin)
export class SuperAdminController {
  constructor(
    private readonly superAdminService: SuperAdminService,
    private readonly securityUtils: SecurityUtils,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async findAllUsers(@Query() query: PaginationDto) {
    return this.superAdminService.findAllUsers(query);
  }

  @Patch('users/:id/activate')
  @ApiOperation({ summary: 'Activate a user' })
  @AuditAction('users', 'activate')
  async activateUser(@Param('id') id: string) {
    return this.superAdminService.activateUser(id);
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user' })
  @AuditAction('users', 'deactivate')
  async deactivateUser(@Param('id') id: string) {
    return this.superAdminService.deactivateUser(id);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get all audit logs' })
  async getAuditLogs(@Query() query: PaginationDto) {
    return this.superAdminService.getAuditLogs(query);
  }

  @Get('action-matrix')
  @ApiOperation({ summary: 'Get action matrix' })
  async getActionMatrix() {
    return this.superAdminService.getActionMatrix();
  }

  @Patch('action-matrix')
  @ApiOperation({ summary: 'Update action matrix entry' })
  @AuditAction('action_matrix', 'update')
  async updateActionMatrix(
    @Body('role') role: Role,
    @Body('action') action: string,
    @Body('isAllowed') isAllowed: boolean,
  ) {
    return this.superAdminService.updateActionMatrix(role, action, isAllowed);
  }

  @Get('feature-control')
  @ApiOperation({ summary: 'Get all feature controls' })
  async getFeatureControl() {
    const list = await this.superAdminService.getFeatureControl();
    return list.map((item) => ({
      ...item,
      featureKey: item.key,
    }));
  }

  @Patch('feature-control/:key')
  @ApiOperation({ summary: 'Update feature control' })
  @AuditAction('feature_control', 'update')
  async updateFeatureControl(
    @Param('key') key: string,
    @Body('isEnabled') isEnabled: boolean,
  ) {
    return this.superAdminService.updateFeatureControl(key, isEnabled);
  }

  @Post('impersonate/start')
  @ApiOperation({ summary: 'Start user impersonation' })
  @AuditAction('impersonate', 'start')
  async startImpersonate(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('userId') userId: string,
  ) {
    let encryptedToken = req.cookies?.['accessToken'] as string | undefined;
    if (!encryptedToken && req.headers?.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts[0] === 'Bearer' && parts[1]) {
        encryptedToken = parts[1];
      }
    }

    const result = await this.superAdminService.startImpersonate(userId);

    if (encryptedToken) {
      res.cookie('originalAccessToken', encryptedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000,
      });
    }

    res.cookie('accessToken', result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Impersonation started',
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user,
    };
  }

  @Post('impersonate/stop')
  @ApiOperation({ summary: 'Stop user impersonation' })
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah, Role.member)
  async stopImpersonate(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const originalToken = req.cookies?.['originalAccessToken'] as
      | string
      | undefined;
    if (!originalToken) {
      throw new UnauthorizedException('Tidak sedang dalam mode impersonation');
    }

    let decryptedToken: ImpersonationTokenPayload;
    try {
      const decrypted = this.securityUtils.decrypt(originalToken);
      decryptedToken = this.jwtService.verify<ImpersonationTokenPayload>(
        decrypted,
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Token impersonator tidak valid');
    }

    if (decryptedToken.role !== Role.super_admin) {
      throw new UnauthorizedException('Akses ditolak');
    }

    const adminId = decryptedToken.sub;
    const adminEmail = decryptedToken.email;
    const adminRole = decryptedToken.role;

    const tokens = await this.authService.generateTokens(
      adminId,
      adminEmail,
      adminRole,
    );

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.clearCookie('originalAccessToken', { path: '/' });

    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminId },
      include: { profile: true },
    });

    return {
      message: 'Impersonation stopped',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: adminId,
        email: adminEmail,
        role: adminRole,
        fullName: adminUser?.profile?.fullName || 'Super Administrator',
      },
    };
  }

  @Get('backup')
  @ApiOperation({ summary: 'Get backup snapshots list' })
  getBackups() {
    return this.superAdminService.getBackups();
  }

  @Post('backup')
  @ApiOperation({ summary: 'Trigger a new database snapshot' })
  @AuditAction('backup', 'create')
  async createBackup() {
    return this.superAdminService.createBackup();
  }

  @Get('system-settings')
  @ApiOperation({ summary: 'Get system settings configuration' })
  async getSystemSettings() {
    return this.superAdminService.getSystemSettings();
  }

  @Patch('system-settings')
  @ApiOperation({ summary: 'Update system settings in bulk' })
  @AuditAction('system_settings', 'update')
  async updateSystemSettings(@Body() data: Record<string, string | boolean>) {
    return this.superAdminService.updateSystemSettings(data);
  }
}
