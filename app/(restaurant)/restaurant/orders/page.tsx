import { prisma } from '@/lib/prisma'
import { requireRestaurant } from '@/lib/session'
import { ordersForRestaurant } from '@/lib/restaurant-scope'
import OrdersTable from '@/components/orders/OrdersTable'

export default async function RestaurantOrdersPage() {
  const session = await requireRestaurant()
  const restaurantId = session.user.restaurantId!

  const orders = await prisma.order.findMany({
    where: ordersForRestaurant(restaurantId),
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      driver: { select: { name: true } },
      items: {
        where: { restaurantId },
        include: { restaurant: { select: { name: true } } },
      },
    },
  })

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
