import { requireRestaurant } from '@/lib/session'
import { getRestaurantDashboardStats, getRestaurantById } from '@/lib/api/api_server_backend'
import StatsCard from '@/components/dashboard/StatsCard'
import RecentOrders from '@/components/dashboard/RecentOrders'
import RestaurantInactiveBanner from '@/components/restaurant/RestaurantInactiveBanner'
import RestaurantStandbyBanner from '@/components/restaurant/RestaurantStandbyBanner'
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react'

interface RecentOrder {
  id: string
  orderCounter: number
  total: number
  status: string
  createdAt: Date
  user: {
    name: string
    email: string
  }
}

export default async function RestaurantDashboardPage() {
  const session = await requireRestaurant()
  const restaurantId = session.user.restaurantId!

  const [stats, restaurant] = await Promise.all([
    getRestaurantDashboardStats(restaurantId),
    getRestaurantById(restaurantId),
  ])

  const isStandby = restaurant?.status === 'STAND_BY'

  const transformedRecentOrders: RecentOrder[] = (stats.recentOrders ?? []).map((order: any) => ({
    id: order.id || order._id || `order-${Date.now()}-${Math.random()}`,
    orderCounter: order.orderCounter || order.orderNumber || 0,
    total: order.total || order.subtotal || 0,
    status: order.status || 'pending',
    createdAt: new Date(order.createdAt || order.created_at || new Date()),
    user: {
      name: order.user?.name || order.userName || 'Guest User',
      email: order.user?.email || order.userEmail || 'no-email@example.com'
    }
  }))

  const formattedStats = [
    {
      label: 'Pedidos',
      value: stats.orderCount ?? 0,
      icon: ShoppingBag,
      color: 'orange' as const,
      change: 'do seu restaurante',
    },
    {
      label: 'Clientes',
      value: stats.clientCount ?? 0,
      icon: Users,
      color: 'blue' as const,
      change: 'com pedidos aqui',
    },
    {
      label: 'Produtos',
      value: stats.productCount ?? 0,
      icon: Package,
      color: 'green' as const,
      change: 'no menu',
    },
    {
      label: 'Receita (itens)',
      value: `${((stats.revenue?._sum?.price ?? 0) as number).toLocaleString('pt-AO')} Kz`,
      icon: TrendingUp,
      color: 'purple' as const,
      change: 'vendas registadas',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          {session.user.restaurantName} — visão geral
        </p>
      </div>

      {isStandby && <RestaurantStandbyBanner />}
      {restaurant?.status === 'INACTIVE' && <RestaurantInactiveBanner />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {formattedStats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <RecentOrders
        orders={transformedRecentOrders}
        orderLinkPrefix="/restaurant/orders"
        ordersListHref="/restaurant/orders"
      />
    </div>
  )
}