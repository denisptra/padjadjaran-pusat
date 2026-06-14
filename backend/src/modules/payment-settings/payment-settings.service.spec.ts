import { Test, TestingModule } from '@nestjs/testing';
import { PaymentSettingsService } from './payment-settings.service';
import { PaymentSettingRepository } from '../../core/repositories/payment-setting.repository';

describe('PaymentSettingsService', () => {
  let service: PaymentSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentSettingsService,
        { provide: PaymentSettingRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<PaymentSettingsService>(PaymentSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
