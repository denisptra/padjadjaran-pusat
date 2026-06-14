import { Test, TestingModule } from '@nestjs/testing';
import { RegionsController } from './regions.controller';
import { RegionsService } from './regions.service';

describe('RegionsController', () => {
  let controller: RegionsController;

  const mockRegionsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    deactivate: jest.fn(),
    assignAdmin: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegionsController],
      providers: [{ provide: RegionsService, useValue: mockRegionsService }],
    }).compile();

    controller = module.get<RegionsController>(RegionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
