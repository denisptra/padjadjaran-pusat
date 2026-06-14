import { Test, TestingModule } from '@nestjs/testing';
import { MeService } from './me.service';
import { UserRepository } from '../../core/repositories/user.repository';
import { MemberProfileRepository } from '../../core/repositories/member-profile.repository';
import { SecurityUtils } from '../../core/utils/security.utils';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('MeService', () => {
  let service: MeService;

  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockMemberProfileRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockSecurityUtils = {
    decrypt: jest.fn().mockImplementation((val) => val),
    encrypt: jest.fn().mockImplementation((val) => val),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeService,
        { provide: UserRepository, useValue: mockUserRepository },
        {
          provide: MemberProfileRepository,
          useValue: mockMemberProfileRepository,
        },
        { provide: SecurityUtils, useValue: mockSecurityUtils },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<MeService>(MeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
