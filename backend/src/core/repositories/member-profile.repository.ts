import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';
import { MemberProfile } from '@prisma/client';
import { SecurityUtils } from '../utils/security.utils';

@Injectable()
export class MemberProfileRepository extends BaseRepository<MemberProfile> {
  constructor(
    prisma: PrismaService,
    private readonly securityUtils: SecurityUtils,
  ) {
    super(prisma);
  }

  get model() {
    return this.prisma.memberProfile;
  }

  get modelName() {
    return 'memberProfile';
  }

  // Override create to encrypt NIK
  async create(data: any, tx?: any): Promise<MemberProfile> {
    if (data.nik && !data.nik.includes(':')) {
      data.nik = this.securityUtils.encrypt(data.nik);
    }
    return super.create(data, tx);
  }

  // Override update to encrypt NIK
  async update(where: any, data: any, tx?: any): Promise<MemberProfile> {
    if (data.nik && !data.nik.includes(':')) {
      data.nik = this.securityUtils.encrypt(data.nik);
    }
    return super.update(where, data, tx);
  }

  async paginateMembers(params: any, tx?: any): Promise<any> {
    const { page = 1, limit = 1000, where, orderBy, include } = params;
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
        this.getModel(tx).findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include,
        }),
        this.count(where, tx)
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
