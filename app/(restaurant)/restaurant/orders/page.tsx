import { requireRestaurant } from '@/lib/session'
import { getRestaurantOrders } from '@/lib/api/api_server_backend'
import OrdersTable from '@/components/orders/OrdersTable'

// Define the expected shape for OrderRow based on the error
interface OrderRow {
  id: string
  orderCounter: number
  total: number
  status: string
  createdAt: Date | string
  user: {
    name: string
    email: string
  }
  driver?: {
    name?: string
    phone?: string
  } | null
  items?: Array<{
    id?: string
    name?: string
    quantity?: number
    price?: number
  }>
}

export default async function RestaurantOrdersPage() {
  const session = await requireRestaurant()
  const restaurantId = session.user.restaurantId!

  const orders = await getRestaurantOrders(restaurantId)

  // Transform orders to match the expected format
  const transformedOrders: OrderRow[] = orders.map((order: any) => ({
    id: order.id || order._id || `order-${Date.now()}-${Math.random()}`,
    orderCounter: order.orderCounter || order.orderNumber || 0,
    total: order.total || order.subtotal || 0,
    status: order.status || 'pending',
    createdAt: order.createdAt || order.created_at || new Date().toISOString(),
    user: {
      name: order.user?.name || order.userName || 'Guest User',
      email: order.user?.email || order.userEmail || 'no-email@example.com'
    },
    driver: order.driver || null, // Add driver field
    items: (order.items || []).map((item: any) => ({
      id: item.id || item._id,
      name: item.name || item.productName,
      quantity: item.quantity || 1,
      price: item.price || item.subtotal || 0
    }))
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Pedidos</h1>
        <p className="text-gray-400 mt-1">{transformedOrders.length} pedidos do restaurante</p>
      </div>
      <OrdersTable
        orders={transformedOrders as any}
        orderLinkPrefix="/restaurant/orders"
        hideRestaurantColumn
      />
    </div>
  )
}