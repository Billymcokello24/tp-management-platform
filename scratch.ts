import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'LECTURER' },
    select: { email: true, password: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
  console.log("Lecturers in DB:", users.length);
  for (const u of users.slice(0, 5)) {
    const isDefault = await bcryptjs.compare("password123", u.password);
    console.log(`Email: ${u.email}, Created: ${u.createdAt}, Hash: ${u.password.substring(0, 10)}..., IsDefault: ${isDefault}`);
  }
}
main().finally(() => prisma.$disconnect());
