import { Test, TestingModule } from '@nestjs/testing';
import { SuperAdminService } from './super-admin.service';
import { UserRepository } from '../../core/repositories/user.repository';
import { ActionMatrixRepository } from '../../core/repositories/action-matrix.repository';
import { FeatureControlRepository } from '../../core/repositories/feature-control.repository';
import { AuditLogRepository } from '../../core/repositories/audit-log.repository';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

describe('SuperAdminService', () => {
  let service: SuperAdminService;

  const mockUserRepository = {
    findAll: jest.fn(),
    count: jest.fn(),
    paginate: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockActionMatrixRepository = {
    findAll: jest.fn(),
    update: jest.fn(),
    model: {
      upsert: jest.fn(),
    },
  };

  const mockFeatureControlRepository = {
    findAll: jest.fn(),
    update: jest.fn(),
    model: {
      upsert: jest.fn(),
    },
  };

  const mockAuditLogRepository = {
    findAll: jest.fn(),
    count: jest.fn(),
    paginate: jest.fn(),
  };

  const mockPrismaService = {
    user: { findMany: jest.fn(), findUnique: jest.fn() },
    actionMatrix: { findMany: jest.fn() },
    featureControl: { findMany: jest.fn() },
    systemSetting: { findMany: jest.fn(), upsert: jest.fn() },
    region: { findMany: jest.fn() },
    province: { findMany: jest.fn() },
    announcement: { findMany: jest.fn() },
    approval: { findMany: jest.fn() },
    payment: { findMany: jest.fn() },
  };

  const mockAuthService = {
    generateTokens: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminService,
        { provide: UserRepository, useValue: mockUserRepository },
        {
          provide: ActionMatrixRepository,
          useValue: mockActionMatrixRepository,
        },
        {
          provide: FeatureControlRepository,
          useValue: mockFeatureControlRepository,
        },
        { provide: AuditLogRepository, useValue: mockAuditLogRepository },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<SuperAdminService>(SuperAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
