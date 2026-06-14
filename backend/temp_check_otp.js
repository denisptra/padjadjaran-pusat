const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const otp = await prisma.otpToken.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  console.log(JSON.stringify(otp, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
