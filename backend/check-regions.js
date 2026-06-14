const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const provinces = await prisma.province.findMany({
    include: {
      _count: {
        select: { regions: true }
      }
    }
  });
  console.log('--- PROVINCES IN DB ---');
  provinces.forEach(p => {
    console.log(`${p.name} (isOverseas: ${p.isOverseas}) - ID: ${p.id} - Regions Count: ${p._count.regions}`);
  });

  const regions = await prisma.region.findMany({
    include: {
      province: true
    }
  });
  console.log('\n--- REGIONS IN DB ---');
  regions.forEach(r => {
    console.log(`${r.name} - Active: ${r.isActive} - Province: ${r.province ? r.province.name : 'NONE'} (ID: ${r.provinceId})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
