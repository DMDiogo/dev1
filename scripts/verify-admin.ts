import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

async function main() {
  const email = 'admin@foodadmin.ao'
  const password = 'admin123'

  const user = await prisma.user.findUnique({ where: { email } })
  console.log('Found:', user ? { email: user.email, role: user.role } : null)

  if (user) {
    const valid = await bcrypt.compare(password, user.password)
    console.log('Password admin123 valid:', valid)
    console.log('Hash prefix:', user.password.slice(0, 7))
  }

  const all = await prisma.user.findMany({
    where: { email: { contains: 'admin' } },
    select: { email: true, role: true },
  })
  console.log('Users matching admin:', all)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
