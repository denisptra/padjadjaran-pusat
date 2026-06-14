import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const duplicates = await prisma.memberProfile.groupBy({
    by: ['phone'],
    _count: {
      phone: true,
    },
    having: {
      phone: {
        _count: {
          gt: 1,
        },
      },
    },
  });
  console.log("Duplicate phone numbers:", JSON.stringify(duplicates, null, 2));
}

main().finally(() => prisma.$disconnect());
