import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { OrderStatus } from '@prisma/client'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      driver: true,
      items: { include: { product: true, restaurant: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { status } = await request.json()

    if (!status || !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(order)
  } catch {
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
      { status: 400 }
    )
  }
}
