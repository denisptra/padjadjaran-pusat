import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { PaymentSetting } from '@prisma/client';

@Injectable()
export class PaymentSettingRepository extends BaseRepository<PaymentSetting> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }
  get model() {
    return this.prisma.paymentSetting;
  }
}
