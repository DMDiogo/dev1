import { prisma } from '@/lib/prisma'
import StatsCard from '@/components/dashboard/StatsCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import RecentOrders from '@/components/dashboard/RecentOrders'
import { ShoppingBag, Users, UtensilsCrossed, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const [totalOrders, totalUsers, totalRestaurants, revenue, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.restaurant.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
    ])

  const stats = [
    {
      label: 'Total de Pedidos',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'orange' as const,
      change: '+12% este mês',
    },
    {
      label: 'Clientes',
      value: totalUsers,
      icon: Users,
      color: 'blue' as const,
      change: '+5 hoje',
    },
    {
      label: 'Restaurantes',
      value: totalRestaurants,
      icon: UtensilsCrossed,
      color: 'green' as const,
      change: 'activos',
    },
    {
      label: 'Receita Total',
      value: `${(revenue._sum.total ?? 0).toLocaleString('pt-AO')} Kz`,
      icon: TrendingUp,
      color: 'purple' as const,
      change: '+8% este mês',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          Dashboard
        </h1>
        <p className="text-gray-400 mt-1">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart />
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  )
}
