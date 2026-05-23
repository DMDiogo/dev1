import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@foodadmin.ao').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD ?? 'admin123'
  const name = process.env.ADMIN_NAME ?? 'Administrador'

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: 'ADMIN', name },
    create: {
      email,
      password: hashed,
      name,
      telephone: process.env.ADMIN_TELEPHONE ?? '+244900000001',
      role: 'ADMIN',
    },
  })

  console.log('Administrador criado com sucesso.')
  console.log('  Email:', user.email)
  console.log('  Nome:', user.name)
  console.log('')
  console.log('Este utilizador não se regista no site — apenas via este comando.')
  console.log('Opcional no .env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_TELEPHONE')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
