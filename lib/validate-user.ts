// lib/validate-user.ts
import bcrypt from 'bcryptjs'
import { findUserForLogin } from '@/lib/api/api_server_backend' // Changed import

export async function validateUserCredentials(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim()

  // Use the public version for login
  const user = await findUserForLogin(normalizedEmail) // Changed this line

  if (!user) {
    return { ok: false as const, reason: 'not_found' as const }
  }

  if (user.role !== 'ADMIN' && user.role !== 'RESTAURANT') {
    return { ok: false as const, reason: 'role' as const }
  }

  const valid = bcrypt.compareSync(password, user.password)
  if (!valid) {
    return { ok: false as const, reason: 'password' as const }
  }

  const needsSetup =
    user.role === 'RESTAURANT' && !user.restaurantId

  return {
    ok: true as const,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      restaurantName: user.restaurantName ?? null,
      needsSetup,
    },
  }
}