import 'dotenv/config'
import { publicFetcher } from '@/lib/api/api_server_backend'

// Define the expected user response type
interface AdminUserResponse {
  id: string
  email: string
  name: string
  role: string
  telephone?: string
  createdAt?: string
}

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@foodadmin.ao').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD ?? 'admin123'
  const name = process.env.ADMIN_NAME ?? 'Administrador'
  const telephone = process.env.ADMIN_TELEPHONE ?? '+244900000001'

  // Don't hash the password here - let the backend hash it
  // The backend should hash the password before storing
  const userData = {
    email,
    password, // Send plain password, backend will hash it
    name,
    telephone,
    role: 'ADMIN',
  }

  try {
    console.log('Creating admin user:', { email, name, role: 'ADMIN' })
    
    // Type the response from publicFetcher
    const user = await publicFetcher<AdminUserResponse>('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    console.log('✓ Administrador criado com sucesso.')
    console.log('  Email:', user.email)
    console.log('  Nome:', user.name)
    console.log('  Role:', user.role)
    console.log('')
    console.log('Este utilizador não se regista no site — apenas via este comando.')
    console.log('Opcional no .env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_TELEPHONE')
    
    process.exit(0)
  } catch (error: any) {
    console.error('✗ Erro ao criar administrador:', error.message || error)
    
    if (error.response?.status === 409) {
      console.error('  Um utilizador com este email já existe.')
    }
    
    process.exit(1)
  }
}

main()