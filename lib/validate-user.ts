import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function validateUserCredentials(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim()

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { restaurant: { select: { name: true } } },
  })

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
      restaurantName: user.restaurant?.name ?? null,
      needsSetup,
    },
  }
}
