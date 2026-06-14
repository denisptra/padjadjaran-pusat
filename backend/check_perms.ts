import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const perms = await prisma.actionMatrix.findMany({
    where: { role: 'member' },
  });
  console.log("Member permissions in DB:", JSON.stringify(perms, null, 2));
}

main().finally(() => prisma.$disconnect());
