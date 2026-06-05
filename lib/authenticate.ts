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
  restaurantLogo: string | null
  needsSetup: boolean
}

async function fetchRestaurantLogo(
  restaurantId: string,
  accessToken: string
): Promise<string | null> {
  if (!BACKEND_API_URL) return null

  try {
    const response = await fetch(
      `${BACKEND_API_URL}/api/restaurants/${restaurantId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }
    )
    if (!response.ok) return null
    const data = await response.json()
    return data.logo?.trim() || null
  } catch {
    return null
  }
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
  } catch (error) {
    console.error('[Auth] Network error contacting API:', error)
    return { ok: false, reason: 'network' }
  }

  const loginData = await loginResponse.json().catch(() => ({}))

  if (!loginResponse.ok) {
    const apiMessage =
      typeof loginData.error === 'string' ? loginData.error : null
    console.log('[Auth] API login failed:', loginResponse.status, apiMessage)
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

let restaurantId = owned?.id ?? profile?.restaurantId ?? null
let restaurantName = owned?.name ?? profile?.restaurantName ?? null
let restaurantStatus = owned?.status ?? profile?.restaurantStatus ?? null

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

  let restaurantLogo: string | null = null
  if (restaurantId && accessToken) {
    restaurantLogo = await fetchRestaurantLogo(restaurantId, accessToken)
  }

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
      restaurantLogo,
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
  restaurantLogo?: string | null
  needsSetup?: boolean
  accessToken?: string
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

  let restaurantLogo: string | null = null
  if (user.accessToken) {
    restaurantLogo = await fetchRestaurantLogo(linked.id, user.accessToken)
  }

  return {
    ...user,
    restaurantId: linked.id,
    restaurantName: linked.name,
    restaurantStatus: linked.status ?? null,
    restaurantLogo,
    needsSetup: false,
  }
}
