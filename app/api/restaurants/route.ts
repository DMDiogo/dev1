import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/geocode'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

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
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, address, telephone, email, taxId, website, logo } = body

    if (!name?.trim() || !address?.trim()) {
      return NextResponse.json(
        { error: 'Nome e morada são obrigatórios' },
        { status: 400 }
      )
    }

    const trimmedAddress = address.trim()
    const geocoded = await geocodeAddress(trimmedAddress)

    const restaurant = await prisma.restaurant.create({
      data: {
        name: name.trim(),
        address: trimmedAddress,
        telephone: telephone?.trim() || null,
        email: email?.trim() || null,
        taxId: taxId?.trim() || null,
        website: website?.trim() || null,
        logo: logo?.trim() || null,
        latitude: geocoded?.latitude ?? null,
        longitude: geocoded?.longitude ?? null,
      },
    })

    return NextResponse.json(
      {
        ...restaurant,
        geocoded: !!geocoded,
        geocodeMessage: geocoded
          ? `Coordenadas obtidas (${geocoded.source}): ${geocoded.latitude.toFixed(5)}, ${geocoded.longitude.toFixed(5)}`
          : 'Restaurante criado. Não foi possível obter GPS — tenta incluir bairro e cidade (ex: Talatona, Luanda, Angola).',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[api/restaurants POST]', error)
    return NextResponse.json(
      { error: 'Erro ao criar restaurante' },
      { status: 400 }
    )
  }
}
