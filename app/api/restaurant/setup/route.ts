import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { geocodeAddress } from '@/lib/geocode'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'RESTAURANT') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { restaurantId: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 })
    }

    if (dbUser.restaurantId) {
      return NextResponse.json(
        { error: 'Já tem um restaurante associado' },
        { status: 409 }
      )
    }

    const body = await request.json()
    const { name, address, telephone, email, taxId } = body

    if (!name?.trim() || !address?.trim()) {
      return NextResponse.json(
        { error: 'Nome e morada são obrigatórios' },
        { status: 400 }
      )
    }

    const trimmedAddress = address.trim()
    const geocoded = await geocodeAddress(trimmedAddress)

    const restaurant = await prisma.$transaction(async (tx) => {
      const created = await tx.restaurant.create({
        data: {
          name: name.trim(),
          address: trimmedAddress,
          telephone: telephone?.trim() || null,
          email: email?.trim() || null,
          taxId: taxId?.trim() || null,
          latitude: geocoded?.latitude ?? null,
          longitude: geocoded?.longitude ?? null,
        },
      })

      await tx.user.update({
        where: { id: session.user.id },
        data: { restaurantId: created.id },
      })

      return created
    })

    return NextResponse.json(
      {
        restaurant,
        geocoded: !!geocoded,
        geocodeMessage: geocoded
          ? `Coordenadas obtidas (${geocoded.source}).`
          : 'Restaurante criado. Não foi possível obter GPS — inclua bairro e cidade (ex: Talatona, Luanda, Angola).',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[api/restaurant/setup]', error)
    return NextResponse.json(
      { error: 'Erro ao criar restaurante' },
      { status: 500 }
    )
  }
}
