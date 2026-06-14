import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [Role.super_admin, Role.admin_pusat];
  const actions = ['cms:create', 'cms:update', 'cms:delete'];

  for (const role of roles) {
    for (const action of actions) {
      await prisma.actionMatrix.upsert({
        where: { role_action: { role, action } },
        update: { isAllowed: true },
        create: { role, action, isAllowed: true },
      });
    }
  }

  console.log('Action matrix patched with CMS permissions');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
