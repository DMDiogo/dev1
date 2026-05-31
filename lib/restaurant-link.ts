import { promises as fs } from 'fs'
import path from 'path'
import { backendAdminFetch } from '@/lib/backend-admin'
import { unwrapList } from '@/lib/restaurant-data'

export type LinkedRestaurant = {
  id: string
  name: string
  status?: string | null
}

type UserContext = {
  id: string
  email: string
  telephone?: string | null
  name?: string | null
}

const LINKS_DIR = path.join(process.cwd(), '.data')
const LINKS_FILE = path.join(LINKS_DIR, 'restaurant-links.json')

function normalizePhone(phone?: string | null) {
  if (!phone) return ''
  return phone.replace(/\D/g, '').slice(-9)
}

async function readLinks(): Promise<Record<string, LinkedRestaurant>> {
  try {
    const raw = await fs.readFile(LINKS_FILE, 'utf-8')
    return JSON.parse(raw) as Record<string, LinkedRestaurant>
  } catch {
    return {}
  }
}

async function writeLinks(links: Record<string, LinkedRestaurant>) {
  await fs.mkdir(LINKS_DIR, { recursive: true })
  await fs.writeFile(LINKS_FILE, JSON.stringify(links, null, 2), 'utf-8')
}

export async function getStoredRestaurantLink(
  userId: string
): Promise<LinkedRestaurant | null> {
  const links = await readLinks()
  return links[userId] ?? null
}

export async function storeRestaurantLink(
  userId: string,
  restaurant: LinkedRestaurant
) {
  const links = await readLinks()
  links[userId] = restaurant
  await writeLinks(links)
}

async function findRestaurantFromApi(
  user: UserContext
): Promise<LinkedRestaurant | null> {
  try {
    const restaurants = unwrapList(
      await backendAdminFetch<
        (LinkedRestaurant & { email?: string; telephone?: string })[]
      >('/api/restaurants')
    )

    const normalizedEmail = user.email.toLowerCase()
    const userPhone = normalizePhone(user.telephone)

    return (
      restaurants.find((restaurant) => {
        if (restaurant.email?.toLowerCase() === normalizedEmail) return true
        if (
          userPhone &&
          normalizePhone(restaurant.telephone) === userPhone
        ) {
          return true
        }
        return false
      }) ?? null
    )
  } catch (error) {
    console.error('[restaurant-link] API lookup failed:', error)
    return null
  }
}

export async function resolveRestaurantForUser(
  user: UserContext
): Promise<LinkedRestaurant | null> {
  const stored = await getStoredRestaurantLink(user.id)
  if (stored) return stored

  const fromApi = await findRestaurantFromApi(user)
  if (fromApi) {
    await storeRestaurantLink(user.id, fromApi)
    return fromApi
  }

  return null
}
