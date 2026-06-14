import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    try {
      // Ensure viewCount column exists in CmsPublication table in the database
      await this.$executeRawUnsafe(
        `ALTER TABLE "CmsPublication" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;`
      );
      console.log('Database schema checked: CmsPublication.viewCount column verified/added.');
    } catch (e: any) {
      console.error('Failed to auto-sync CmsPublication.viewCount column:', e.message || e);
    }

    try {
      // Ensure 'region:delete' permission is auto-seeded in ActionMatrix for admin_pusat and super_admin
      const rolesToSeed = ['super_admin', 'admin_pusat'];
      for (const role of rolesToSeed) {
        const existing = await this.actionMatrix.findUnique({
          where: {
            role_action: {
              role: role as any,
              action: 'region:delete',
            },
          },
        });
        if (!existing) {
          await this.actionMatrix.create({
            data: {
              role: role as any,
              action: 'region:delete',
              isAllowed: true,
            },
          });
          console.log(`Auto-seeded 'region:delete' permission for role ${role}`);
        }
      }
    } catch (e: any) {
      console.error('Failed to auto-seed region:delete permissions:', e.message || e);
    }
  }
}
