import { fetcher } from '@/lib/api/api_server_backend'

export type RestaurantRecord = {
  id: string
  name: string
  address: string
  telephone?: string | null
  email?: string | null
  website?: string | null
  taxId?: string | null
  logo?: string | null
  status?: string | null
}

export async function getRestaurantRecord(
  restaurantId: string
): Promise<RestaurantRecord> {
  return fetcher<RestaurantRecord>(`/api/restaurants/${restaurantId}`)
}

/** PATCH com dados completos — evita falhas em APIs que exigem corpo JSON completo. */
export async function patchRestaurantMerged(
  restaurantId: string,
  current: RestaurantRecord,
  changes: Partial<RestaurantRecord> & { status?: string | null }
) {
  const payload: Record<string, unknown> = {
    name: changes.name ?? current.name,
    address: changes.address ?? current.address,
    telephone:
      changes.telephone !== undefined
        ? changes.telephone
        : current.telephone ?? null,
    email: changes.email !== undefined ? changes.email : current.email ?? null,
    website:
      changes.website !== undefined ? changes.website : current.website ?? null,
    taxId: changes.taxId !== undefined ? changes.taxId : current.taxId ?? null,
    logo: changes.logo !== undefined ? changes.logo : current.logo ?? null,
  }

  if (changes.status !== undefined) {
    payload.status = changes.status
  }

  return fetcher<RestaurantRecord>(`/api/restaurants/${restaurantId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
