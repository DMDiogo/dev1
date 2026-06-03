import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const LOGO_DIR = path.join(process.cwd(), 'public', 'restaurant-logos')
const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export function extensionForMime(mime: string) {
  if (mime === 'image/jpeg') return '.jpg'
  if (mime === 'image/png') return '.png'
  if (mime === 'image/webp') return '.webp'
  if (mime === 'image/gif') return '.gif'
  return '.jpg'
}

export async function saveRestaurantLogoFile(
  restaurantId: string,
  file: File
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Formato inválido. Use JPG, PNG, WebP ou GIF.')
  }

  if (file.size > MAX_BYTES) {
    throw new Error('Imagem demasiado grande (máximo 2 MB).')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = extensionForMime(file.type)
  const filename = `${restaurantId}-${Date.now()}${ext}`

  await mkdir(LOGO_DIR, { recursive: true })
  await writeFile(path.join(LOGO_DIR, filename), buffer)

  return `/restaurant-logos/${filename}`
}

export function normalizeLogoUrlInput(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed
}
