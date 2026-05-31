import { requireRestaurant } from '@/lib/session'
import { getRestaurantDashboardStats } from '@/lib/api/api_server_backend'
import StatsCard from '@/components/dashboard/StatsCard'
import RecentOrders from '@/components/dashboard/RecentOrders'
import RestaurantStandbyBanner from '@/components/restaurant/RestaurantStandbyBanner'
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react'

export default async function RestaurantDashboardPage() {
  const session = await requireRestaurant()
  const restaurantId = session.user.restaurantId!
  const isStandby = session.user.restaurantStatus === 'STAND_BY'

  const stats = await getRestaurantDashboardStats(restaurantId)

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {formattedStats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <RecentOrders
        orders={stats.recentOrders ?? []}
        orderLinkPrefix="/restaurant/orders"
        ordersListHref="/restaurant/orders"
      />
    </div>
  )
}
