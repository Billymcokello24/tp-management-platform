const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const schools = await prisma.school.findMany();
  console.log("Schools:", schools);
  
  const students = await prisma.student.findMany({ include: { school: true } });
  console.log("Students (schoolId):", students.map(s => ({ admissionNumber: s.admissionNumber, schoolId: s.schoolId, schoolName: s.school?.name })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
