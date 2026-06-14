import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== INVESTIGATING ADMIN WILAYAH & REGION DATA ===');
  
  // 1. Find all Admin Wilayah users
  const admins = await prisma.user.findMany({
    where: { role: Role.admin_wilayah },
    include: { profile: true, managedRegion: true }
  });

  if (admins.length === 0) {
    console.log('No Admin Wilayah found in database.');
    return;
  }

  for (const admin of admins) {
    console.log(`\nAdmin: ${admin.email} (ID: ${admin.id})`);
    console.log(`Managed Region: ${admin.managedRegion ? `${admin.managedRegion.name} (ID: ${admin.managedRegion.id})` : 'NONE'}`);
    
    if (admin.managedRegion) {
      const memberCount = await prisma.memberProfile.count({
        where: { regionId: admin.managedRegion.id, user: { role: Role.member } }
      });
      console.log(`Members in this region: ${memberCount}`);
      
      if (memberCount > 0) {
        const sampleMembers = await prisma.memberProfile.findMany({
          where: { regionId: admin.managedRegion.id, user: { role: Role.member } },
          take: 2,
          include: { user: { select: { email: true, status: true } } }
        });
        console.log('Sample members:', sampleMembers.map(m => ({ name: m.fullName, email: m.user.email })));
      }
    } else {
        // Find if there is a region intended for this admin but not linked via adminId
        const possibleRegion = await prisma.region.findFirst({
            where: { members: { some: { userId: admin.id } } }
        });
        if (possibleRegion) {
            console.log(`Admin is a member of region: ${possibleRegion.name}, but NOT assigned as adminId.`);
        }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
