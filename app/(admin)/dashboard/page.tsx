// app/(admin)/dashboard/page.tsx
import { getSession } from '@/lib/session'
import { getDashboardMetrics } from '@/lib/dashboard-stats'
import StatsCard from '@/components/dashboard/StatsCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import RecentOrders from '@/components/dashboard/RecentOrders'
import { ShoppingBag, Users, UtensilsCrossed, TrendingUp } from 'lucide-react'

// Define the expected shape of a RecentOrder (match the component's expected type)
interface RecentOrder {
  id: string
  orderCounter: number
  total: number
  status: string
  createdAt: Date  // Changed from string to Date
  user: {
    name: string
    email: string
  }
}

export default async function DashboardPage() {
  const [session, data] = await Promise.all([
    getSession(),
    getDashboardMetrics(),
  ])

  // Transform recentOrders to match the expected format
  const transformedRecentOrders: RecentOrder[] = (data.recentOrders || []).map((order: any) => ({
    id: order.id || order._id || `order-${Date.now()}-${Math.random()}`,
    orderCounter: order.orderCounter || order.orderNumber || 0,
    total: order.total || order.subtotal || 0,
    status: order.status || 'pending',
    createdAt: new Date(order.createdAt || order.created_at || new Date()), // Convert to Date object
    user: {
      name: order.user?.name || order.userName || 'Guest User',
      email: order.user?.email || order.userEmail || 'no-email@example.com'
    }
  }))

  // Map the backend response to the expected format
  const metrics = {
    totalOrders: data.totalOrders || 0,
    totalUsers: data.totalUsers || 0,
    totalRestaurants: data.totalRestaurants || 0,
    revenueTotal: data.totalRevenue || 0,
    orderChange: data.orderChange || '0%',
    revenueChange: data.revenueChange || '0%',
    usersToday: data.usersToday || 0,
    monthlyRevenue: data.monthlyRevenue || [],
    recentOrders: transformedRecentOrders,
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