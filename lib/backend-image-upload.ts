import { getApiBaseUrl } from '@/lib/api/api_server_backend'

export type UploadImageResult = {
  imageUrl: string
}

/** Envia imagem para POST /api/upload do backend (campo `image`). */
export async function uploadImageToBackend(
  file: Blob,
  filename: string,
  accessToken?: string | null
): Promise<UploadImageResult> {
  const baseUrl = getApiBaseUrl()
  const formData = new FormData()
  formData.append('image', file, filename)

  const headers: Record<string, string> = {}
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  let response: Response
  try {
    response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
      cache: 'no-store',
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'fetch failed'
    throw new Error(
      `Não foi possível enviar a imagem para a API. (${detail})`
    )
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data.error || data.message || `Upload falhou (${response.status})`
    )
  }

  const imageUrl = data.imageUrl || data.url || data.logo
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('Resposta de upload inválida da API')
  }

  return { imageUrl }
}
