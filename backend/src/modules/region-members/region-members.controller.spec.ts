import { Test, TestingModule } from '@nestjs/testing';
import { RegionMembersController } from './region-members.controller';
import { RegionMembersService } from './region-members.service';

describe('RegionMembersController', () => {
  let controller: RegionMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegionMembersController],
      providers: [{ provide: RegionMembersService, useValue: {} }],
    }).compile();

    controller = module.get<RegionMembersController>(RegionMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
