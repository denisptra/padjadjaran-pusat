import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.memberProfile.update({
    where: { id: "2397967d-0cf1-4fcb-b360-bc446d71c961" },
    data: { phone: "087871704301" }
  });
  await prisma.memberProfile.update({
    where: { id: "65f5ea13-dbf6-4e6e-a3cd-e9005841d2d4" },
    data: { phone: "087871704302" }
  });
  console.log("Duplicate phone numbers updated.");
}

main().finally(() => prisma.$disconnect());
