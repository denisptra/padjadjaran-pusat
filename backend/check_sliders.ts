import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sliders = await prisma.cmsHeroSlider.findMany();
  console.log("Total sliders:", sliders.length);
  console.dir(sliders, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
