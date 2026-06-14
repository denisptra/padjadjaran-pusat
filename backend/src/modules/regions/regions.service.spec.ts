import { Test, TestingModule } from '@nestjs/testing';
import { RegionsService } from './regions.service';
import { RegionRepository } from '../../core/repositories/region.repository';
import { MemberProfileRepository } from '../../core/repositories/member-profile.repository';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('RegionsService', () => {
  let service: RegionsService;

  const mockRegionRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  const mockMemberProfileRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionsService,
        { provide: RegionRepository, useValue: mockRegionRepository },
        {
          provide: MemberProfileRepository,
          useValue: mockMemberProfileRepository,
        },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<RegionsService>(RegionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
