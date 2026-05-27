import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { adminFetcher } from '@/lib/api/api_server_backend'

async function main() {
  const email = 'admin@foodadmin.ao'
  const password = 'admin123'

  try {
    // Find user by email
    const users = await adminFetcher<any[]>(`/api/users?search=${encodeURIComponent(email)}`, {}, true)
    const user = users.find(u => u.email === email) || null

    console.log('Found:', user ? { email: user.email, role: user.role } : null)

    if (user) {
      // Since we can't directly compare passwords without the backend,
      // we'll attempt to login with the credentials
      const loginData = {
        email,
        password
      }

      try {
        const loginResult = await adminFetcher<any>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(loginData),
        }, false) // Don't require auth for login

        console.log('Login successful with admin123:', !!loginResult)
        if (loginResult) {
          console.log('User role:', loginResult.role)
          console.log('User ID:', loginResult.id)
        }
      } catch (loginError) {
        console.log('Password admin123 valid: false')
        console.log('Login failed:', loginError.message)
      }
    }

    // Get all users with admin in email
    const allUsers = await adminFetcher<any[]>('/api/users', {}, true)
    const adminUsers = allUsers.filter(u => u.email?.includes('admin'))
    console.log('Users matching admin:', adminUsers.map(u => ({ email: u.email, role: u.role })))
  } catch (error) {
    console.error('Error verifying admin:', error)
    process.exit(1)
  }
}

main()
