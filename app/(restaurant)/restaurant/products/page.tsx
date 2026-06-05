import { requireRestaurant } from '@/lib/session'
import { adminFetcher } from '@/lib/api/api_server_backend'
import { unwrapList } from '@/lib/restaurant-data'
import ProductsPanel from '@/components/products/ProductsPanel'

export default async function RestaurantProductsPage() {
  const session = await requireRestaurant()
  const restaurantId = session.user.restaurantId!

  const [productsRaw, restaurant] = await Promise.all([
    adminFetcher<any[]>(`/api/products?restaurantId=${restaurantId}`),
    adminFetcher<any>(`/api/restaurants/${restaurantId}`),
  ])

  const products = unwrapList(productsRaw)
  const restaurants = restaurant ? [{ id: restaurant.id, name: restaurant.name }] : []

  return (
    <ProductsPanel
      products={products}
      restaurants={restaurants}
      showRestaurantColumn={false}
      editable
    />
  )
}
