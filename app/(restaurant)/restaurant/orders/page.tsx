import { requireRestaurant } from '@/lib/session'
import { adminFetcher } from '@/lib/api/api_server_backend'
import OrdersTable from '@/components/orders/OrdersTable'

export default async function RestaurantOrdersPage() {
  const session = await requireRestaurant()
  const restaurantId = session.user.restaurantId!

  const orders = await adminFetcher<any[]>(`/api/restaurant/${restaurantId}/orders`)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Pedidos</h1>
        <p className="text-gray-400 mt-1">{orders.length} pedidos do restaurante</p>
      </div>
      <OrdersTable
        orders={orders}
        orderLinkPrefix="/restaurant/orders"
        hideRestaurantColumn
      />
    </div>
  )
}
