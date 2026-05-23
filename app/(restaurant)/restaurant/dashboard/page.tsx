import { prisma } from '@/lib/prisma'
import { requireRestaurant } from '@/lib/session'
import { ordersForRestaurant } from '@/lib/restaurant-scope'
import StatsCard from '@/components/dashboard/StatsCard'
import RecentOrders from '@/components/dashboard/RecentOrders'
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react'

export default async function RestaurantDashboardPage() {
  const session = await requireRestaurant()
  const restaurantId = session.user.restaurantId!
  const orderFilter = ordersForRestaurant(restaurantId)

  const [orderCount, productCount, revenue, recentOrders, clientCount] =
    await Promise.all([
      prisma.order.count({ where: orderFilter }),
      prisma.product.count({ where: { restaurantId } }),
      prisma.orderItem.aggregate({
        where: { restaurantId },
        _sum: { price: true },
      }),
      prisma.order.findMany({
        where: orderFilter,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      prisma.user.count({
        where: {
          role: 'CLIENT',
          orders: {
            some: {
              items: { some: { restaurantId } },
            },
          },
        },
      }),
    ])

  const stats = [
    {
      label: 'Pedidos',
      value: orderCount,
      icon: ShoppingBag,
      color: 'orange' as const,
      change: 'do seu restaurante',
    },
    {
      label: 'Clientes',
      value: clientCount,
      icon: Users,
      color: 'blue' as const,
      change: 'com pedidos aqui',
    },
    {
      label: 'Produtos',
      value: productCount,
      icon: Package,
      color: 'green' as const,
      change: 'no menu',
    },
    {
      label: 'Receita (itens)',
      value: `${(revenue._sum.price ?? 0).toLocaleString('pt-AO')} Kz`,
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <RecentOrders
        orders={recentOrders}
        orderLinkPrefix="/restaurant/orders"
        ordersListHref="/restaurant/orders"
      />
    </div>
  )
}
