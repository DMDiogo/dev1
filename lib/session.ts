import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export type Role = 'ADMIN' | 'RESTAURANT' | 'CLIENT' | 'DRIVER'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireAuth(allowedRoles: Role[]) {
  const session = await getSession()
  if (!session?.user) {
    redirect('/login')
  }
  if (!allowedRoles.includes(session.user.role as Role)) {
    if (session.user.role === 'RESTAURANT') {
      redirect(
        session.user.restaurantId
          ? '/restaurant/dashboard'
          : '/setup'
      )
    }
    if (session.user.role === 'ADMIN') {
      redirect('/dashboard')
    }
    redirect('/login')
  }
  return session
}

export async function requireAdmin() {
  return requireAuth(['ADMIN'])
}

export async function requireRestaurant() {
  const session = await requireAuth(['RESTAURANT'])
  if (!session.user.restaurantId) {
    redirect('/setup')
  }
  return session
}
