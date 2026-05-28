import { Role } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

async function main() {
  // Production Admin Account
  const adminPassword = await bcryptjs.hash('Admin@2026!', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tmu.ac.ke' },
    update: {},
    create: {
      email: 'admin@tmu.ac.ke',
      name: 'TP Coordinator',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })

  console.log('✅ Admin user seeded successfully:')
  console.log(`   Email:    admin@tmu.ac.ke`)
  console.log(`   Password: Admin@2026!`)
  console.log(`   Role:     ADMIN`)
  console.log({ admin })
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
