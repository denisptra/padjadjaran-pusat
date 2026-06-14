import { Test, TestingModule } from '@nestjs/testing';
import { RegionMembersService } from './region-members.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('RegionMembersService', () => {
  let service: RegionMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionMembersService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<RegionMembersService>(RegionMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
