import { Test, TestingModule } from '@nestjs/testing';
import { PaymentSettingsController } from './payment-settings.controller';
import { PaymentSettingsService } from './payment-settings.service';

describe('PaymentSettingsController', () => {
  let controller: PaymentSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentSettingsController],
      providers: [{ provide: PaymentSettingsService, useValue: {} }],
    }).compile();

    controller = module.get<PaymentSettingsController>(
      PaymentSettingsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
