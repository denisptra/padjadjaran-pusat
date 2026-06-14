import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: 'denitriosaputra357@gmail.com' },
    include: { managedRegion: true }
  });
  if (admin?.managedRegion) {
    const members = await prisma.memberProfile.findMany({
      where: { regionId: admin.managedRegion.id },
      include: { user: true }
    });
    members.forEach(m => {
      console.log(`Member: ${m.fullName}, Role: ${m.user?.role}, Status: ${m.user?.status}`);
    });
  }
}
main().finally(() => prisma.$disconnect());
