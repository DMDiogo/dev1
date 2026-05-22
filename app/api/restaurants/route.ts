import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    include: {
      workingHours: true,
      paymentMethods: true,
      _count: { select: { products: true } },
    },
  })
  return NextResponse.json(restaurants)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, address, telephone, email, taxId, website, logo } = body

    if (!name?.trim() || !address?.trim()) {
      return NextResponse.json(
        { error: 'Nome e morada são obrigatórios' },
        { status: 400 }
      )
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        telephone: telephone?.trim() || null,
        email: email?.trim() || null,
        taxId: taxId?.trim() || null,
        website: website?.trim() || null,
        logo: logo?.trim() || null,
      },
    })

    return NextResponse.json(restaurant, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao criar restaurante' },
      { status: 400 }
    )
  }
}
