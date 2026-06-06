/** Converte caminho relativo da API (/uploads/...) ou URL absoluta para URL utilizável no browser. */
export function resolveMediaUrl(
  path: string | null | undefined
): string | null {
  if (!path?.trim()) return null

  const trimmed = path.trim()

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  if (trimmed.startsWith('/restaurant-logos')) {
    return trimmed
  }

  const base = (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://aodelivery-api.angolaerp.co.ao'
  ).replace(/\/$/, '')

  if (trimmed.startsWith('/uploads') || trimmed.startsWith('/')) {
    return `${base}${trimmed}`
  }

  return `${base}/uploads/${trimmed}`
}
