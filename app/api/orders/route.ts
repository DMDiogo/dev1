import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, telephone: true } },
      driver: { select: { name: true } },
      items: {
        include: {
          product: { select: { name: true } },
          restaurant: { select: { name: true } },
        },
      },
    },
  })
  return NextResponse.json(orders)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const order = await prisma.order.create({ data: body })
    return NextResponse.json(order, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 400 }
    )
  }
}
