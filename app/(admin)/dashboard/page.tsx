// app/(admin)/dashboard/page.tsx
import { getSession } from '@/lib/session'
import { getDashboardMetrics } from '@/lib/dashboard-stats'
import StatsCard from '@/components/dashboard/StatsCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import RecentOrders from '@/components/dashboard/RecentOrders'
import { ShoppingBag, Users, UtensilsCrossed, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const [session, data] = await Promise.all([
    getSession(),
    getDashboardMetrics(),
  ])


  // Map the backend response to the expected format
  const metrics = {
    totalOrders: data.totalOrders || 0,
    totalUsers: data.totalUsers || 0,
    totalRestaurants: data.totalRestaurants || 0,
    revenueTotal: data.totalRevenue || 0, // Map totalRevenue to revenueTotal
    orderChange: data.orderChange || '0%',
    revenueChange: data.revenueChange || '0%',
    usersToday: data.usersToday || 0,
    monthlyRevenue: data.monthlyRevenue || [],
    recentOrders: data.recentOrders || [],
  }

  const stats = [
    {
      label: 'Total de Pedidos',
      value: metrics.totalOrders,
      icon: ShoppingBag,
      color: 'orange' as const,
      change: metrics.orderChange,
    },
    {
      label: 'Clientes',
      value: metrics.totalUsers,
      icon: Users,
      color: 'blue' as const,
      change:
        metrics.usersToday > 0
          ? `+${metrics.usersToday} hoje`
          : 'sem novos hoje',
    },
    {
      label: 'Restaurantes',
      value: metrics.totalRestaurants,
      icon: UtensilsCrossed,
      color: 'green' as const,
      change: 'na plataforma',
    },
    {
      label: 'Receita Total',
      value: `${metrics.revenueTotal.toLocaleString('pt-AO')} Kz`,
      icon: TrendingUp,
      color: 'purple' as const,
      change: metrics.revenueChange,
    },
  ]

    // Debug: Log the actual data
  console.log('Dashboard metrics from backend:', metrics)
  console.log('Keys:', Object.keys(metrics))

  
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Admin'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          Olá, {firstName}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart data={metrics.monthlyRevenue} />
        <RecentOrders orders={metrics.recentOrders} />
      </div>
    </div>
  )
}