import { fetcher } from '@/lib/api/api_server_backend'
import { unwrapList } from '@/lib/restaurant-data'
import ProductsPanel from '@/components/products/ProductsPanel'

export default async function ProductsPage() {
  const [productsRaw, restaurantsRaw] = await Promise.all([
    fetcher<any[]>('/api/products', {}, true),
    fetcher<any[]>('/api/restaurants', {}, false),
  ])

  const products = unwrapList(productsRaw)
  const restaurants = unwrapList(restaurantsRaw).map((r: { id: string; name: string }) => ({
    id: r.id,
    name: r.name,
  }))

  return (
    <ProductsPanel
      products={products}
      restaurants={restaurants}
      showRestaurantColumn
    />
  )
}
