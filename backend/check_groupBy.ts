import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.memberProfile.groupBy({
    by: ['memberType'],
    _count: true,
  });
  console.log('--- GROUP BY RESULT ---');
  console.log(JSON.stringify(result, null, 2));

  const resultExplicit = await prisma.memberProfile.groupBy({
    by: ['memberType'],
    _count: { id: true },
  });
  console.log('--- GROUP BY EXPLICIT RESULT ---');
  console.log(JSON.stringify(resultExplicit, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
