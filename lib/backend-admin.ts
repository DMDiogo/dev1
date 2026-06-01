const BACKEND_API_URL = process.env.BACKEND_API_URL || ''

let cachedToken: { value: string; expiresAt: number } | null = null

async function getBackendAdminToken(): Promise<string> {
  if (!BACKEND_API_URL) {
    throw new Error('BACKEND_API_URL em falta no servidor')
  }

  // Optional: allow a pre-generated token (useful for production secrets rotation)
  const directToken = process.env.BACKEND_ADMIN_TOKEN
  if (directToken) return directToken

  let email = process.env.BACKEND_ADMIN_EMAIL
  let password = process.env.BACKEND_ADMIN_PASSWORD

  // Dev convenience: allow setup flow without configuring env vars locally.
  // These values are server-side only (never exposed to the browser unless you use NEXT_PUBLIC_*)
  if ((!email || !password) && process.env.NODE_ENV !== 'production') {
    email = 'admin@foodadmin.ao'
    password = 'admin123'
  }

  if (!email || !password) {
    throw new Error(
      'Credenciais de serviço em falta (BACKEND_ADMIN_EMAIL / BACKEND_ADMIN_PASSWORD ou BACKEND_ADMIN_TOKEN)'
    )
  }

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value
  }

  const response = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || !data.access_token) {
    throw new Error(data.error || 'Falha ao autenticar serviço admin')
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + 50 * 60 * 1000,
  }

  return data.access_token
}

export async function backendAdminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getBackendAdminToken()
  const url = `${BACKEND_API_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      data.error || data.message || `API error: ${response.status}`
    throw new Error(message)
  }

  return data as T
}
