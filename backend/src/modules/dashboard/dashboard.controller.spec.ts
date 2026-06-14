import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { RegistrationStatusGuard } from '../../core/guards/registration-status.guard';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: DashboardService, useValue: {} },
        { provide: RegistrationStatusGuard, useValue: { canActivate: () => true } },
        { provide: Reflector, useValue: {} },
        { provide: PrismaService, useValue: {} }
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
