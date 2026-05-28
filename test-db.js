const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { email: true, role: true } });
  console.log("Users in DB:", users);
  
  const students = await prisma.student.findMany({ select: { admissionNumber: true, userId: true } });
  console.log("Students in DB:", students);
}

main().catch(console.error).finally(() => prisma.$disconnect());
