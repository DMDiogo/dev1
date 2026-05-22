import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role')

  const users = await prisma.user.findMany({
    where: role
      ? { role: role as 'CLIENT' | 'DRIVER' | 'RESTAURANT' | 'ADMIN' }
      : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      telephone: true,
      role: true,
      address: true,
      createdAt: true,
      _count: { select: { orders: true, driverOrders: true } },
    },
  })

  return NextResponse.json(users)
}
