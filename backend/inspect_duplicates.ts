import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const members = await prisma.memberProfile.findMany({
    where: { phone: "087871704303" },
    include: { user: true }
  });
  console.log("Members with duplicate phone:", JSON.stringify(members, null, 2));
}

main().finally(() => prisma.$disconnect());
