import { findUserForLogin } from '@/lib/api/api_server_backend'
import { resolveRestaurantForUser } from '@/lib/restaurant-link'

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || ''

type AuthUser = {
  id: string
  name: string
  email: string
  telephone: string | null
  role: 'ADMIN' | 'RESTAURANT'
  restaurantId: string | null
  restaurantName: string | null
  restaurantStatus: string | null
  needsSetup: boolean
}

export async function authenticateWithBackend(
  email: string,
  password: string
): Promise<
  | { ok: true; user: AuthUser; accessToken: string }
  | { ok: false; reason: 'invalid_credentials' | 'role' | 'network' }
> {
  const normalizedEmail = email.toLowerCase().trim()

  let loginResponse: Response
  try {
    loginResponse = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
      }),
    })
  } catch {
    return { ok: false, reason: 'network' }
  }

  const loginData = await loginResponse.json().catch(() => ({}))

  if (!loginResponse.ok) {
    return { ok: false, reason: 'invalid_credentials' }
  }

  const accessToken =
    loginData.access_token || loginData.loginToken || loginData.token

  if (!accessToken || !loginData.user) {
    return { ok: false, reason: 'invalid_credentials' }
  }

  const apiUser = loginData.user

  if (apiUser.role !== 'ADMIN' && apiUser.role !== 'RESTAURANT') {
    return { ok: false, reason: 'role' }
  }

  const profile = await findUserForLogin(normalizedEmail)
  const owned =
    profile?.ownedRestaurants?.[0] ?? profile?.restaurants?.[0] ?? null

  let restaurantId = profile?.restaurantId ?? owned?.id ?? null
  let restaurantName = profile?.restaurantName ?? owned?.name ?? null
  let restaurantStatus =
    profile?.restaurantStatus ?? owned?.status ?? null

  const telephone = apiUser.telephone ?? profile?.telephone ?? null

  if (apiUser.role === 'RESTAURANT' && !restaurantId) {
    const linked = await resolveRestaurantForUser({
      id: apiUser.id,
      email: normalizedEmail,
      telephone,
      name: apiUser.name ?? profile?.name,
    })
    if (linked) {
      restaurantId = linked.id
      restaurantName = linked.name
      restaurantStatus = linked.status ?? null
    }
  }

  const needsSetup = apiUser.role === 'RESTAURANT' && !restaurantId

  return {
    ok: true,
    accessToken,
    user: {
      id: apiUser.id,
      name: apiUser.name ?? profile?.name ?? '',
      email: apiUser.email ?? normalizedEmail,
      telephone,
      role: apiUser.role,
      restaurantId,
      restaurantName,
      restaurantStatus,
      needsSetup,
    },
  }
}

export async function enrichRestaurantSession(user: {
  id: string
  email: string
  role: string
  telephone?: string | null
  restaurantId?: string | null
  restaurantName?: string | null
  restaurantStatus?: string | null
  needsSetup?: boolean
}) {
  if (user.role !== 'RESTAURANT' || user.restaurantId) {
    return user
  }

  const linked = await resolveRestaurantForUser({
    id: user.id,
    email: user.email,
    telephone: user.telephone,
  })

  if (!linked) return user

  return {
    ...user,
    restaurantId: linked.id,
    restaurantName: linked.name,
    restaurantStatus: linked.status ?? null,
    needsSetup: false,
  }
}
