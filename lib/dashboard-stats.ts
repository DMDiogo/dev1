import { prisma } from '@/lib/prisma'

const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

function monthRange(year: number, month: number) {
  const start = new Date(year, month, 1, 0, 0, 0, 0)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export function formatChange(current: number, previous: number, suffix = '') {
  if (previous === 0) {
    if (current === 0) return `0${suffix}`
    return `+100%${suffix}`
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct}%${suffix}`
}

export async function getDashboardMetrics() {
  const now = new Date()
  const thisMonth = monthRange(now.getFullYear(), now.getMonth())
  const lastMonth = monthRange(
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
    now.getMonth() === 0 ? 11 : now.getMonth() - 1
  )

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    totalOrders,
    ordersThisMonth,
    ordersLastMonth,
    totalUsers,
    usersToday,
    totalRestaurants,
    revenueAll,
    revenueThisMonth,
    revenueLastMonth,
    recentOrders,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { createdAt: { gte: thisMonth.start, lte: thisMonth.end } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: lastMonth.start, lte: lastMonth.end } },
    }),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.user.count({
      where: { role: 'CLIENT', createdAt: { gte: todayStart } },
    }),
    prisma.restaurant.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: thisMonth.start, lte: thisMonth.end } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: lastMonth.start, lte: lastMonth.end } },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
    getMonthlyRevenueChart(),
  ])

  const revThis = revenueThisMonth._sum.total ?? 0
  const revLast = revenueLastMonth._sum.total ?? 0

  return {
    totalOrders,
    ordersThisMonth,
    ordersLastMonth,
    totalUsers,
    usersToday,
    totalRestaurants,
    revenueTotal: revenueAll._sum.total ?? 0,
    revenueThisMonth: revThis,
    revenueLastMonth: revLast,
    recentOrders,
    monthlyRevenue,
    orderChange: formatChange(ordersThisMonth, ordersLastMonth, ' vs mês anterior'),
    revenueChange: formatChange(revThis, revLast, ' vs mês anterior'),
  }
}

export async function getMonthlyRevenueChart() {
  const now = new Date()
  const points: { month: string; revenue: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const { start, end } = monthRange(d.getFullYear(), d.getMonth())

    const agg = await prisma.order.aggregate({
      where: { createdAt: { gte: start, lte: end } },
      _sum: { total: true },
    })

    points.push({
      month: MONTH_LABELS[d.getMonth()],
      revenue: agg._sum.total ?? 0,
    })
  }

  return points
}
