import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { UserRepository } from '../../core/repositories/user.repository';
import { MemberProfileRepository } from '../../core/repositories/member-profile.repository';
import { RegionRepository } from '../../core/repositories/region.repository';
import { ApprovalRepository } from '../../core/repositories/approval.repository';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: UserRepository, useValue: {} },
        { provide: MemberProfileRepository, useValue: {} },
        { provide: RegionRepository, useValue: {} },
        { provide: ApprovalRepository, useValue: {} },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
