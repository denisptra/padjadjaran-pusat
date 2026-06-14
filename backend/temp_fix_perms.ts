import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [Role.super_admin, Role.admin_pusat];
  const actions = [
    // CMS
    'cms:create', 'cms:update', 'cms:delete', 'cms:read',
    'payment_setting:read', 'payment_setting:update',
    // Members
    'member:read', 'member:create', 'member:update', 'member:delete',
    // Regions
    'region:read', 'region:create', 'region:update', 'region:delete',
    // Announcements
    'announcement:read', 'announcement:read_one', 'announcement:create', 'announcement:update', 'announcement:delete', 'announcement:publish', 'announcement:unpublish',
    // Approvals & Payments
    'approval:read', 'approval:process',
    'payment:read', 'payment:process',
    // Dashboard
    'dashboard:read_stats'
  ];

  console.log('Synchronizing permissions for Admin Pusat and Super Admin...');

  for (const role of roles) {
    for (const action of actions) {
      await prisma.actionMatrix.upsert({
        where: { role_action: { role, action } },
        update: { isAllowed: true },
        create: { role, action, isAllowed: true },
      });
    }
  }

  console.log('✅ Permissions synchronized successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
