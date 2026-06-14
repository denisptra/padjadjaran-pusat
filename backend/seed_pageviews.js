const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding fake page views...');
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const count = Math.floor(Math.random() * 50) + 10;
    
    for (let j = 0; j < count; j++) {
      await prisma.pageView.create({
        data: {
          path: '/',
          sessionId: 'fake-session',
          visitedAt: date
        }
      });
    }
  }
  console.log('Done!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
