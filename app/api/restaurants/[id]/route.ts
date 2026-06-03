import { fetcher } from '@/lib/api/api_server_backend'
import { NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/geocode'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { patchRestaurantMerged, getRestaurantRecord } from '@/lib/restaurant-update'


export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const restaurant = await fetcher<any>(`/api/restaurants/${id}`)
    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { error: 'Restaurante não encontrado' },
      { status: 404 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role === 'RESTAURANT') {
      if (session.user.restaurantId !== id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, address, telephone, email, website, taxId, logo, status } = body

    if (name !== undefined && !String(name).trim()) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
    }
    if (address !== undefined && !String(address).trim()) {
      return NextResponse.json({ error: 'Morada inválida' }, { status: 400 })
    }

    let latitude: number | null | undefined
    let longitude: number | null | undefined

    if (address !== undefined) {
      const trimmedAddress = String(address).trim()
      const coords = await geocodeAddress(trimmedAddress)
      latitude = coords?.latitude ?? null
      longitude = coords?.longitude ?? null
    }

    const current = await getRestaurantRecord(id)

    const mergedChanges: Parameters<typeof patchRestaurantMerged>[2] = {}

    if (name !== undefined) mergedChanges.name = String(name).trim()
    if (address !== undefined) mergedChanges.address = String(address).trim()
    if (telephone !== undefined) {
      mergedChanges.telephone = telephone?.trim() || null
    }
    if (email !== undefined) mergedChanges.email = email?.trim() || null
    if (website !== undefined) mergedChanges.website = website?.trim() || null
    if (taxId !== undefined) mergedChanges.taxId = taxId?.trim() || null
    if (logo !== undefined) mergedChanges.logo = logo?.trim() || null

    if (status !== undefined && session.user.role === 'ADMIN') {
      mergedChanges.status = status
    }

    const restaurant = await patchRestaurantMerged(id, current, mergedChanges)

    const response: Record<string, unknown> = { ...restaurant }
    if (address !== undefined) {
      response.geocoded = latitude != null && longitude != null
      response.geocodeMessage =
        latitude != null && longitude != null
          ? `Coordenadas obtidas: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
          : 'Morada actualizada. Não foi possível obter GPS automaticamente.'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[api/restaurants PATCH]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar restaurante' },
      { status: 400 }
    )
  }
}
