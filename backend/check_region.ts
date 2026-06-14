import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: 'denitriosaputra357@gmail.com' },
    include: { managedRegion: true }
  });
  console.log('Admin:', admin?.email, 'Region:', admin?.managedRegion?.name);
  if (admin?.managedRegion) {
    const count = await prisma.memberProfile.count({
      where: { regionId: admin.managedRegion.id }
    });
    console.log('Members in region:', count);
  }
}
main().finally(() => prisma.$disconnect());
