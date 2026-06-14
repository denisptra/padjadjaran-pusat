import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaymentSettingRepository } from '../../core/repositories/payment-setting.repository';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class PaymentSettingsService {
  constructor(
    private readonly paymentSettingRepository: PaymentSettingRepository,
  ) {}

  async findAll(query: PaginationDto) {
    const regCount = await this.paymentSettingRepository.model.count({
      where: { type: 'REGISTRATION' },
    });
    if (regCount === 0) {
      await this.paymentSettingRepository.model.create({
        data: {
          type: 'REGISTRATION',
          amount: 150000,
          bankName: 'BCA',
          accountNumber: '1234567890',
          accountOwner: 'PPS PADJADJARAN PUSAT',
          whatsapp: '6281234567890',
          instruction:
            'Transfer ke rekening BCA di atas, simpan bukti transfer dan kirimkan konfirmasi via WhatsApp.',
          isActive: true,
        },
      });
    }

    const { page, limit, search, sortBy, sortOrder } = query;
    const where: any = search
      ? { type: { contains: search, mode: 'insensitive' } }
      : {};

    return this.paymentSettingRepository.paginate({
      where,
      page,
      limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const setting = await this.paymentSettingRepository.findOne({ id });
    if (!setting) throw new NotFoundException('Payment setting not found');
    return setting;
  }

  async update(id: string, data: any) {
    try {
      console.log(`[PaymentSettings] Update attempt for ID or Type: ${id}`);

      let setting;
      
      // Try finding by ID first if it looks like a UUID
      if (id && id.length > 20) {
        setting = await this.paymentSettingRepository.findOne({ id });
      }

      // If not found by ID or ID is a type string, find by type
      if (!setting) {
        const typeToFind = (id === 'null' || !id || id.length > 20) ? 'REGISTRATION' : id;
        setting = await this.paymentSettingRepository.model.findFirst({
          where: { type: typeToFind },
        });
      }

      if (!setting) {
        throw new NotFoundException('Pengaturan pembayaran tidak ditemukan.');
      }

      const updateData: any = {};
      if (data.bankName !== undefined) updateData.bankName = data.bankName;
      if (data.accountNumber !== undefined)
        updateData.accountNumber = data.accountNumber;
      if (data.accountOwner !== undefined)
        updateData.accountOwner = data.accountOwner;
      if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
      if (data.instruction !== undefined)
        updateData.instruction = data.instruction;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.amount !== undefined) updateData.amount = Number(data.amount);
      if (data.messageFormat !== undefined)
        updateData.messageFormat = data.messageFormat;

      console.log(`[PaymentSettings] Final Target ID: ${setting.id} (Type: ${setting.type})`);

      return await this.paymentSettingRepository.model.update({
        where: { id: setting.id },
        data: updateData,
      });
    } catch (error) {
      console.error(`[PaymentSettings] FAILED update:`, error.message);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        `Gagal menyimpan pengaturan: ${error.message}`,
      );
    }
  }
}
