import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const permissions = await prisma.actionMatrix.findMany({
    where: { role: Role.admin_wilayah, action: 'member:read' }
  });
  console.log('admin_wilayah member:read permissions:', permissions);
}
main().finally(() => prisma.$disconnect());
