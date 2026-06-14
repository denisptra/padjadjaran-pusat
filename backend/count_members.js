const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const usersCount = await prisma.user.count();
  const membersCount = await prisma.memberProfile.count();
  const activeMembersCount = await prisma.memberProfile.count({
    where: {
      user: {
        status: 'ACTIVE'
      }
    }
  });
  console.log('--- DATABASE COUNT ---');
  console.log('Total users:', usersCount);
  console.log('Total member profiles:', membersCount);
  console.log('Active member profiles:', activeMembersCount);
  const activeAndInactive = await prisma.memberProfile.count({
    where: {
      user: {
        status: { in: ['ACTIVE', 'INACTIVE'] }
      }
    }
  });
  console.log('Active and inactive member profiles:', activeAndInactive);
  const pending = await prisma.memberProfile.count({
    where: {
      user: {
        status: 'PENDING'
      }
    }
  });
  console.log('Pending member profiles:', pending);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
