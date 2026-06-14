import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberType } from '@prisma/client';

@Injectable()
export class MemberUtilsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateKtaNumber(userId: string, tx?: any): Promise<string> {
    const prisma = tx || this.prisma;
    
    const profile = await prisma.memberProfile.findUnique({
      where: { userId },
    });

    if (!profile) return '';

    const year = new Date().getFullYear().toString();
    
    // Type Codes: Khusus=01, Pencak Silat=02, Umum=03
    let typeCode = '03';
    if (profile.memberType === MemberType.khusus) typeCode = '01';
    else if (profile.memberType === MemberType.pencak_silat) typeCode = '02';

    // Nationality Code: WNI=1, WNA=2
    const natCode = profile.nationality === 'WNA' ? '2' : '1';

    const prefix = `${year}${typeCode}${natCode}`;

    // Find latest KTA for this prefix
    const latestMember = await prisma.memberProfile.findFirst({
      where: { ktaNumber: { startsWith: prefix } },
      orderBy: { ktaNumber: 'desc' },
      select: { ktaNumber: true },
    });

    let nextSequence = 1;
    if (latestMember?.ktaNumber) {
      const lastSeq = parseInt(latestMember.ktaNumber.substring(prefix.length), 10);
      if (!isNaN(lastSeq)) nextSequence = lastSeq + 1;
    }

    return `${prefix}${nextSequence.toString().padStart(4, '0')}`;
  }
}
