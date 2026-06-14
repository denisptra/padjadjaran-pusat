import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || '7a6c9d5e3f1b4a0c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c';

async function main() {
  const admin = await prisma.user.findUnique({
    where: { email: 'denitriosaputra357@gmail.com' }
  });
  
  if (admin) {
    const token = jwt.sign(
      { sub: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log(token);
  }
}
main().finally(() => prisma.$disconnect());
