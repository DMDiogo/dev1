import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { TaxPercentage } from '@prisma/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get('restaurantId')

  const products = await prisma.product.findMany({
    where: restaurantId ? { restaurantId } : undefined,
    orderBy: { name: 'asc' },
    include: { restaurant: { select: { name: true } } },
  })

  return NextResponse.json(products)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price, restaurantId, taxPercentage } = body

    if (!name?.trim() || !restaurantId) {
      return NextResponse.json(
        { error: 'Nome e restaurante são obrigatórios' },
        { status: 400 }
      )
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Preço inválido' },
        { status: 400 }
      )
    }

    const tax =
      taxPercentage && Object.values(TaxPercentage).includes(taxPercentage)
        ? taxPercentage
        : TaxPercentage.VAT_14

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price,
        restaurantId,
        taxPercentage: tax,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 400 }
    )
  }
}
