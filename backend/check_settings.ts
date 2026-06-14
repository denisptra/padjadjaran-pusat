import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ['super_admin', 'admin_pusat', 'admin_wilayah']
      }
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true
    }
  });

  console.log('--- Current Admin Users ---');
  console.table(admins);

  const permissions = await prisma.actionMatrix.findMany({
    where: {
      isAllowed: true
    },
    orderBy: [
      { role: 'asc' },
      { action: 'asc' }
    ]
  });

  console.log('\n--- Active Permissions (ActionMatrix) ---');
  // Group by role for better visibility
  const grouped: any = {};
  permissions.forEach(p => {
    if (!grouped[p.role]) grouped[p.role] = [];
    grouped[p.role].push(p.action);
  });
  
  Object.keys(grouped).forEach(role => {
    console.log(`[${role}]: ${grouped[role].length} actions`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
