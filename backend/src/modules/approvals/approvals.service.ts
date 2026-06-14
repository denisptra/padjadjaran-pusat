import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApprovalRepository } from '../../core/repositories/approval.repository';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../core/prisma/prisma.service';
import { UserStatus, Role } from '@prisma/client';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly approvalRepository: ApprovalRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(query: any, currentUser: any) {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      type,
      status,
      regionId,
      memberType,
    } = query;

    const where: any = {};
    if (search) {
      where.OR = [
        {
          creator: {
            profile: { fullName: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          creator: {
            profile: { phone: { contains: search, mode: 'insensitive' } },
          },
        },
        { creator: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (type) where.type = type;
    if (status) {
      if (status.includes(',')) {
        where.status = { in: status.split(',') };
      } else {
        where.status = status;
      }
    }

    let scopedRegionId = regionId;

    // Role filtering: admin_wilayah only sees their region
    if (currentUser.role === Role.admin_wilayah) {
      const region = await this.prisma.region.findUnique({
        where: { adminId: currentUser.id },
      });
      if (region?.id) {
        scopedRegionId = region.id;
      } else {
        // Admin wilayah without a region sees no approvals
        return {
          data: [],
          meta: {
            total: 0,
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            totalPages: 0,
          },
        };
      }
    }

    // Additional filters for member data
    if (scopedRegionId || memberType) {
      where.creator = {
        profile: {
          ...(scopedRegionId && { regionId: scopedRegionId }),
          ...(memberType && { memberType }),
        },
      };
    }

    return this.approvalRepository.paginate({
      where,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      include: {
        creator: { include: { profile: { include: { region: true } } } },
        processor: { include: { profile: true } },
      },
    });
  }

  async findOne(id: string) {
    const approval = await this.approvalRepository.findOne(
      { id },
      {
        creator: { include: { profile: { include: { region: true } } } },
        processor: { include: { profile: true } },
      },
    );
    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }
    return approval;
  }

  async updateStatus(
    id: string,
    status: string,
    processorId: string,
    notes?: string,
  ) {
    const approval = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const updatedApproval = await tx.approval.update({
        where: { id },
        data: {
          status,
          processorId,
          ...(notes !== undefined && { notes }),
        },
      });

      if (status === 'approved') {
        if (approval.type === 'registration') {
          // Generate E-KTA
          const ktaNumber = await this.generateKtaNumber(
            tx,
            approval.creatorId,
          );
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 2);

          await tx.memberProfile.update({
            where: { userId: approval.creatorId },
            data: {
              ktaNumber,
              registrationStep: 4, // Completed
            },
          });

          await tx.user.update({
            where: { id: approval.creatorId },
            data: { status: UserStatus.ACTIVE },
          });
        }
      }

      // Notify member of approval status update
      try {
        let title = '';
        let content = '';
        if (status === 'approved') {
          title = 'Pendaftaran Disetujui';
          content = 'Selamat! Pendaftaran Anda telah disetujui. E-KTA Anda telah diterbitkan.';
        } else if (status === 'revision') {
          title = 'Revisi Berkas Diperlukan';
          content = `Pendaftaran Anda memerlukan revisi berkas: ${notes || 'Silakan periksa kembali berkas Anda.'}`;
        } else if (status === 'rejected') {
          title = 'Pendaftaran Ditolak';
          content = `Pendaftaran Anda ditolak: ${notes || ''}`;
        }

        if (title && content) {
          await tx.notification.create({
            data: {
              userId: approval.creatorId,
              title,
              content,
              type: 'APPROVAL',
              referenceId: approval.id,
              isRead: false,
            },
          });
        }
      } catch (err) {
        console.error('Failed to notify member of approval update', err);
      }

      return updatedApproval;
    });
  }

  private async generateKtaNumber(tx: any, userId: string) {
    const profile = await tx.memberProfile.findUnique({
      where: { userId },
    });

    const year = new Date().getFullYear().toString();
    
    // Type Codes based on requirement: Khusus=01, Pencak Silat=02, Umum=03
    let typeCode = '03'; // Default Umum
    if (profile?.memberType === 'khusus') typeCode = '01';
    else if (profile?.memberType === 'pencak_silat') typeCode = '02';

    // Nationality Code: WNI=1, WNA=2
    const natCode = profile?.nationality === 'WNA' ? '2' : '1';

    // We want the sequence to be specific to this year, type, and nationality
    const prefix = `${year}${typeCode}${natCode}`;

    // Find the latest KTA for this prefix
    const latestMember = await tx.memberProfile.findFirst({
      where: {
        ktaNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        ktaNumber: 'desc',
      },
      select: {
        ktaNumber: true,
      },
    });

    let nextSequenceNumber = 1;
    if (latestMember && latestMember.ktaNumber) {
      // Extract the sequence part (last 4 digits)
      const lastSequenceStr = latestMember.ktaNumber.substring(prefix.length);
      const lastSequence = parseInt(lastSequenceStr, 10);
      if (!isNaN(lastSequence)) {
        nextSequenceNumber = lastSequence + 1;
      }
    }

    const sequenceStr = nextSequenceNumber.toString().padStart(4, '0');
    return `${prefix}${sequenceStr}`;
  }

  async approve(id: string, processorId: string) {
    return this.updateStatus(id, 'approved', processorId);
  }

  async reject(id: string, processorId: string, notes?: string) {
    if (!notes)
      throw new BadRequestException('Notes are required for rejection');

    const approval = await this.findOne(id);

    // If it's a registration, we perform auto-deletion of the user and profile
    if (approval.type === 'registration') {
      return this.prisma.$transaction(async (tx) => {
        const userId = approval.creatorId;

        // Delete in order to satisfy FK constraints
        await tx.approval.deleteMany({ where: { creatorId: userId } });
        await tx.payment.deleteMany({ where: { userId } });
        await tx.memberProfile.deleteMany({ where: { userId } });
        await tx.user.delete({ where: { id: userId } });

        return {
          message: 'Registration rejected and member data deleted successfully',
        };
      });
    }

    // Default behavior for other types
    return this.updateStatus(id, 'rejected', processorId, notes);
  }

  async requestRevision(id: string, processorId: string, notes?: string) {
    if (!notes)
      throw new BadRequestException('Notes are required for revision');
    return this.updateStatus(id, 'revision', processorId, notes);
  }

  async close(id: string, processorId: string, notes?: string) {
    return this.updateStatus(id, 'closed', processorId, notes);
  }

  // Payment Verification
  async findAllPayments(query: any) {
    const { page, limit, search, status } = query;
    const where: any = {};
    if (search) {
      where.OR = [
        {
          user: {
            profile: { fullName: { contains: search, mode: 'insensitive' } },
          },
        },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) where.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        include: {
          user: { include: { profile: { include: { region: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async verifyPayment(id: string, processorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id },
        data: { status: 'verified' },
      });

      // If it's registration payment, and they have an approval, we might want to auto-approve or notify
      // For now, just mark payment as verified.
      return payment;
    });
  }

  async rejectPayment(id: string, processorId: string, notes: string) {
    return this.prisma.payment.update({
      where: { id },
      data: { status: 'rejected' },
    });
  }
}
