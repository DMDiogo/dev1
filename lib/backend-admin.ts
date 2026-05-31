const BACKEND_API_URL =
  process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || ''

let cachedToken: { value: string; expiresAt: number } | null = null

async function getBackendAdminToken(): Promise<string> {
  const email = process.env.BACKEND_ADMIN_EMAIL
  const password = process.env.BACKEND_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'Credenciais de serviço em falta (BACKEND_ADMIN_EMAIL / BACKEND_ADMIN_PASSWORD)'
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
