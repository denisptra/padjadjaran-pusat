import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.otpToken.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  // For User, we might need to handle the isActive -> status transition if we want to keep data, 
  // but usually it's easier to just reset if it's a major overhaul.
  // However, I'll try to keep users but clear tokens.
  console.log('Cleared tokens');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
