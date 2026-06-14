import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixData() {
  console.log('--- Fixing Inconsistent User Statuses ---');
  
  // Find users who have an 'approved' registration approval but are still 'PENDING'
  const inconsistentUsers = await prisma.user.findMany({
    where: {
      status: 'PENDING',
      approvals: {
        some: {
          type: 'registration',
          status: 'approved'
        }
      }
    }
  });

  console.log(`Found ${inconsistentUsers.length} inconsistent users.`);

  for (const user of inconsistentUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: { status: 'ACTIVE' }
    });
    console.log(`Fixed user: ${user.email} -> Set to ACTIVE`);
  }

  // Also check if any ACTIVE users have a 'pending' approval. If so, they shouldn't be pending anymore.
  const activeWithPending = await prisma.approval.findMany({
    where: {
      status: 'pending',
      creator: {
        status: 'ACTIVE'
      }
    }
  });

  console.log(`Found ${activeWithPending.length} pending approvals for already active users.`);
  for (const approval of activeWithPending) {
    await prisma.approval.update({
      where: { id: approval.id },
      data: { status: 'approved' }
    });
    console.log(`Fixed approval: ${approval.id} -> Set to approved`);
  }
}

fixData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
