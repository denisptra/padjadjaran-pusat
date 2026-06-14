import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== CHECKING PUBLIC DATA ===");
  const sliders = await prisma.cmsHeroSlider.count();
  const gurus = await prisma.cmsGuruBesar.count();
  const gallery = await prisma.cmsGallery.count();
  const publications = await prisma.cmsPublication.count();
  const regions = await prisma.region.count();
  
  console.log(`Hero Sliders: ${sliders}`);
  console.log(`Guru Besar: ${gurus}`);
  console.log(`Gallery: ${gallery}`);
  console.log(`Publications: ${publications}`);
  console.log(`Regions: ${regions}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
