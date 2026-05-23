/**
 * Geocodificação: Nominatim (OSM) + fallback Photon (melhor cobertura em Angola).
 */

export type GeocodeResult = {
  latitude: number
  longitude: number
  displayName: string
  source: 'nominatim' | 'photon'
}

const USER_AGENT = 'FoodAdmin/1.0 (restaurant-admin-panel; contact@foodadmin.ao)'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildAddressVariants(address: string): string[] {
  const trimmed = address.trim()
  const variants = new Set<string>()

  variants.add(trimmed)
  variants.add(
    trimmed.toLowerCase().includes('angola') ? trimmed : `${trimmed}, Angola`
  )

  // Simplificar moradas longas (condomínio, casa, etc.)
  const withoutNumber = trimmed
    .replace(/\b(casa|lote|apt|apartamento|n[º°.]?)\s*\d+\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (withoutNumber.length > 10) {
    variants.add(
      withoutNumber.toLowerCase().includes('angola')
        ? withoutNumber
        : `${withoutNumber}, Angola`
    )
  }

  // Bairros conhecidos em Luanda
  const luandaAreas = [
    'talatona',
    'belas',
    'kilamba',
    'cacuaco',
    'viana',
    'ingombota',
    'maianga',
    'samba',
    'cazenga',
  ]
  for (const area of luandaAreas) {
    if (trimmed.toLowerCase().includes(area)) {
      const name = area.charAt(0).toUpperCase() + area.slice(1)
      variants.add(`${name}, Luanda, Angola`)
    }
  }

  if (trimmed.toLowerCase().includes('luanda') && !trimmed.toLowerCase().includes('angola')) {
    variants.add(`${trimmed}, Angola`)
  }

  return [...variants]
}

async function searchNominatim(query: string): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '3',
    countrycodes: 'ao',
    addressdetails: '0',
  })

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
      cache: 'no-store',
    }
  )

  if (!res.ok) return null

  const data = (await res.json()) as {
    lat: string
    lon: string
    display_name: string
  }[]

  if (!data.length) return null

  const lat = parseFloat(data[0].lat)
  const lng = parseFloat(data[0].lon)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null

  return {
    latitude: lat,
    longitude: lng,
    displayName: data[0].display_name,
    source: 'nominatim',
  }
}

async function searchPhoton(query: string): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    q: query,
    limit: '1',
    lang: 'pt',
  })

  const res = await fetch(`https://photon.komoot.io/api/?${params}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) return null

  const data = (await res.json()) as {
    features?: {
      geometry: { coordinates: [number, number] }
      properties: { name?: string; city?: string; country?: string }
    }[]
  }

  const feature = data.features?.[0]
  if (!feature) return null

  const [lng, lat] = feature.geometry.coordinates
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null

  const props = feature.properties
  const displayName = [props.name, props.city, props.country]
    .filter(Boolean)
    .join(', ')

  return {
    latitude: lat,
    longitude: lng,
    displayName: displayName || query,
    source: 'photon',
  }
}

export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const variants = buildAddressVariants(address)

  // 1) Photon primeiro — rápido e boa cobertura em Luanda/Angola
  for (const variant of variants) {
    const photon = await searchPhoton(variant)
    if (photon) return photon
  }

  // 2) Nominatim (máx. 2 tentativas, respeitar rate limit)
  const nominatim = await searchNominatim(variants[0])
  if (nominatim) return nominatim

  if (variants.length > 1) {
    await sleep(1100)
    return searchNominatim(variants[1])
  }

  return null
}
