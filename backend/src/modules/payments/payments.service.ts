import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentRepository } from '../../core/repositories/payment.repository';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../core/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(query: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = query;

    const where: any = {};
    if (search) {
      where.OR = [
        { status: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.paymentRepository.paginate({
      where,
      page,
      limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      include: { user: true },
    });
  }

  async findOne(id: string) {
    const payment = await this.paymentRepository.findOne(
      { id },
      { user: true },
    );
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async updateStatus(id: string, status: string) {
    const payment = await this.findOne(id);
    const updated = await this.paymentRepository.update({ id }, { status });

    try {
      let title = '';
      let content = '';
      if (status === 'verified' || status === 'approved') {
        title = 'Pembayaran Diverifikasi';
        content = 'Pembayaran pendaftaran KTA Anda telah berhasil diverifikasi oleh Admin.';
      } else if (status === 'rejected') {
        title = 'Pembayaran Ditolak';
        content = 'Pembayaran pendaftaran KTA Anda ditolak. Silakan unggah bukti transfer yang valid.';
      }

      if (title && content) {
        await this.prisma.notification.create({
          data: {
            userId: payment.userId,
            title,
            content,
            type: 'PAYMENT',
            referenceId: payment.id,
            isRead: false,
          },
        });
      }
    } catch (err) {
      console.error('Failed to create payment status notification', err);
    }

    return updated;
  }

  async verify(id: string) {
    return this.updateStatus(id, 'verified');
  }

  async reject(id: string) {
    return this.updateStatus(id, 'rejected');
  }

  async getMyStatus(userId: string) {
    return this.paymentRepository.findAll({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async confirm(
    userId: string,
    data: { amount: number; proofUrl?: string; notes?: string },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          userId,
          amount: data.amount,
          proofUrl: data.proofUrl,
          status: 'pending',
        },
      });

      // Update registration step to 4 (Payment Submitted)
      await tx.memberProfile.update({
        where: { userId },
        data: { registrationStep: 4 },
      });

      // Trigger notification for admins
      try {
        const member = await tx.memberProfile.findUnique({
          where: { userId },
          include: { region: true },
        });
        const memberName = member?.fullName || 'Anggota Baru';
        const notificationTitle = 'Verifikasi Pembayaran Baru';
        const notificationContent = `Anggota ${memberName} telah mengunggah bukti pembayaran KTA. Silakan verifikasi.`;

        const adminsToNotify = new Set<string>();

        // 1. Central Admins & Super Admins
        const centralAdmins = await tx.user.findMany({
          where: {
            role: { in: ['admin_pusat', 'super_admin'] },
            status: 'ACTIVE',
          },
          select: { id: true },
        });
        centralAdmins.forEach((a: any) => adminsToNotify.add(a.id));

        // 2. Regional Admin (if member has region)
        if (member?.regionId) {
          const region = await tx.region.findUnique({
            where: { id: member.regionId },
            select: { adminId: true },
          });
          if (region?.adminId) {
            adminsToNotify.add(region.adminId);
          }
        }

        // Create notification entries
        for (const adminId of adminsToNotify) {
          await tx.notification.create({
            data: {
              userId: adminId,
              title: notificationTitle,
              content: notificationContent,
              type: 'PAYMENT',
              referenceId: payment.id,
              isRead: false,
            },
          });
        }
      } catch (err) {
        console.error('Failed to notify admins of payment confirmation', err);
      }

      return payment;
    });
  }
}
