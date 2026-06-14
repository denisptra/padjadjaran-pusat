import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class PaymentSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.paymentSetting.findFirst();
    if (!settings) {
      settings = await this.prisma.paymentSetting.create({
        data: {
          type: 'REGISTRATION',
          amount: 0,
          isActive: false,
        },
      });
    }
    return settings;
  }

  async updateSettings(data: any) {
    const existing = await this.getSettings();

    const updateData: any = {};
    if (data.bankName !== undefined) updateData.bankName = data.bankName;
    if (data.accountNumber !== undefined)
      updateData.accountNumber = data.accountNumber;
    if (data.accountOwner !== undefined)
      updateData.accountOwner = data.accountOwner;
    if (data.instruction !== undefined)
      updateData.instruction = data.instruction;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.amount !== undefined) updateData.amount = Number(data.amount);
    if (data.messageFormat !== undefined)
      updateData.messageFormat = data.messageFormat;

    return this.prisma.paymentSetting.update({
      where: { id: existing.id },
      data: updateData,
    });
  }
}
