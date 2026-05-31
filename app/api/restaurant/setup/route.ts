import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { geocodeAddress } from '@/lib/geocode'
import { backendAdminFetch } from '@/lib/backend-admin'
import { resolveRestaurantForUser, storeRestaurantLink } from '@/lib/restaurant-link'

export const runtime = 'nodejs'

type ApiRestaurant = {
  id: string
  name: string
  status?: string
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'RESTAURANT') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const existing = await resolveRestaurantForUser({
      id: session.user.id,
      email: session.user.email,
      telephone: session.user.telephone ?? null,
      name: session.user.name,
    })

    if (existing) {
      return NextResponse.json(
        {
          restaurant: existing,
          alreadyExists: true,
          geocodeMessage: null,
        },
        { status: 200 }
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

    const restaurantData = {
      name: name.trim(),
      address: trimmedAddress,
      telephone: telephone?.trim() || null,
      email: email?.trim() || session.user.email,
      taxId: taxId?.trim() || null,
      latitude: geocoded?.latitude ?? null,
      longitude: geocoded?.longitude ?? null,
      status: 'STAND_BY',
    }

    let restaurant = await backendAdminFetch<ApiRestaurant>('/api/restaurants', {
      method: 'POST',
      body: JSON.stringify(restaurantData),
    })

    if (restaurant.status !== 'STAND_BY') {
      restaurant = await backendAdminFetch<ApiRestaurant>(
        `/api/restaurants/${restaurant.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'STAND_BY' }),
        }
      )
    }

    const linked = {
      id: restaurant.id,
      name: restaurant.name,
      status: restaurant.status ?? 'STAND_BY',
    }

    await storeRestaurantLink(session.user.id, linked)

    return NextResponse.json(
      {
        restaurant: linked,
        geocoded: !!geocoded,
        geocodeMessage: geocoded
          ? `Coordenadas obtidas (${geocoded.source}).`
          : 'Restaurante criado. Não foi possível obter GPS — inclua bairro e cidade (ex: Talatona, Luanda, Angola).',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[api/restaurant/setup] error:', error)
    const message =
      error instanceof Error ? error.message : 'Erro ao criar restaurante'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
