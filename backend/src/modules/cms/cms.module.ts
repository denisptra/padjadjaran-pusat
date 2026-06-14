import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { PaymentSettingsController } from './payment-settings.controller';
import { PaymentSettingsService } from './payment-settings.service';
import { PrismaService } from '../../core/prisma/prisma.service';

@Module({
  controllers: [CmsController, PaymentSettingsController],
  providers: [CmsService, PaymentSettingsService, PrismaService],
  exports: [CmsService],
})
export class CmsModule {}
