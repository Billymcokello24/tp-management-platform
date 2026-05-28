import { Role } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

async function main() {
  const passwordHash = await bcryptjs.hash('password123', 10)

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tmu.ac.ke' },
    update: {},
    create: {
      email: 'admin@tmu.ac.ke',
      name: 'TP Coordinator',
      password: passwordHash,
      role: Role.ADMIN,
    },
  })

  // 2. Create Lecturer
  const lecturerUser = await prisma.user.upsert({
    where: { email: 'lecturer@tmu.ac.ke' },
    update: {},
    create: {
      email: 'lecturer@tmu.ac.ke',
      name: 'Dr. Jane Smith',
      password: passwordHash,
      role: Role.LECTURER,
      lecturer: {
        create: {
          department: 'Educational Foundations',
          zone: 'Nairobi',
          county: 'Nairobi',
        },
      },
    },
  })

  // 3. Create Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@tmu.ac.ke' },
    update: {},
    create: {
      email: 'student@tmu.ac.ke',
      name: 'John Doe',
      password: passwordHash,
      role: Role.STUDENT,
      student: {
        create: {
          admissionNumber: 'ED/1234/2026',
          course: 'Bachelor of Education (Arts)',
          subjects: ['Mathematics', 'Geography'],
        },
      },
    },
  })

  // 4. Create School
  const school = await prisma.school.upsert({
    where: { id: 'sample-school-id' }, // We'll just rely on name if we don't know ID, but for seed let's create a new one if not exists
    update: {},
    create: {
      name: 'Nairobi High School',
      county: 'Nairobi',
      subCounty: 'Westlands',
      principal: 'Mr. Omondi',
    },
  })

  console.log({ admin, lecturerUser, studentUser, school })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
