import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { publicFetcher } from '@/lib/api/api_server_backend'

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@foodadmin.ao').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD ?? 'admin123'
  const name = process.env.ADMIN_NAME ?? 'Administrador'
  const telephone = process.env.ADMIN_TELEPHONE ?? '+244900000001'

  const hashed = await bcrypt.hash(password, 12)

  // Use the public API to create the admin user
  const userData = {
    email,
    password: hashed,
    name,
    telephone,
    role: 'ADMIN',
  }

  try {
    const user = await publicFetcher('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    console.log('Administrador criado com sucesso.')
    console.log('  Email:', user.email)
    console.log('  Nome:', user.name)
    console.log('')
    console.log('Este utilizador não se regista no site — apenas via este comando.')
    console.log('Opcional no .env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_TELEPHONE')
  } catch (error) {
    console.error('Erro ao criar administrador:', error)
    process.exit(1)
  }
}

main()
