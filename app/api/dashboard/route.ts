import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const [
    totalOrders,
    totalRevenue,
    totalUsers,
    totalRestaurants,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.restaurant.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, items: true },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),
  ])

  return NextResponse.json({
    totalOrders,
    totalRevenue: totalRevenue._sum.total ?? 0,
    totalUsers,
    totalRestaurants,
    recentOrders,
    ordersByStatus,
  })
}
