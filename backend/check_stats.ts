import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Pending Users ---');
  const pendingUsers = await prisma.user.findMany({
    where: { status: 'PENDING' },
    include: { 
        approvals: true,
        profile: true
    }
  });
  console.log(JSON.stringify(pendingUsers, null, 2));

  console.log('\n--- Inactive Members ---');
  const inactiveMembers = await prisma.user.findMany({
    where: { status: 'INACTIVE', role: 'member' },
    include: { profile: true }
  });
  console.log(JSON.stringify(inactiveMembers, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
