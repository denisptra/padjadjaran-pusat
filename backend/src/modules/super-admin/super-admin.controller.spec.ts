import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { SecurityUtils } from '../../core/utils/security.utils';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('SuperAdminController', () => {
  let controller: SuperAdminController;

  const mockSuperAdminService = {
    findAllUsers: jest.fn(),
    activateUser: jest.fn(),
    deactivateUser: jest.fn(),
    getAuditLogs: jest.fn(),
    getActionMatrix: jest.fn(),
    updateActionMatrix: jest.fn(),
    getFeatureControl: jest.fn(),
    updateFeatureControl: jest.fn(),
    startImpersonate: jest.fn(),
    getBackups: jest.fn(),
    createBackup: jest.fn(),
    getSystemSettings: jest.fn(),
    updateSystemSettings: jest.fn(),
  };

  const mockSecurityUtils = {
    decrypt: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockAuthService = {
    generateTokens: jest.fn(),
  };

  const mockPrismaService = {
    user: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperAdminController],
      providers: [
        { provide: SuperAdminService, useValue: mockSuperAdminService },
        { provide: SecurityUtils, useValue: mockSecurityUtils },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<SuperAdminController>(SuperAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
