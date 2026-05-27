import { NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/geocode'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adminFetcher } from '@/lib/api/api_server_backend'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const restaurant = await adminFetcher<any>(`/api/restaurants/${id}`)

  if (!restaurant) {
    return NextResponse.json(
      { error: 'Restaurante não encontrado' },
      { status: 404 }
    )
  }

  return NextResponse.json(restaurant)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, address, telephone, email, website, taxId, logo } = body

    if (name !== undefined && !String(name).trim()) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
    }
    if (address !== undefined && !String(address).trim()) {
      return NextResponse.json({ error: 'Morada inválida' }, { status: 400 })
    }

    let latitude: number | null | undefined
    let longitude: number | null | undefined
    let geocoded: boolean | undefined
    let geocodeMessage: string | undefined

    if (address !== undefined) {
      const trimmedAddress = String(address).trim()
      const coords = await geocodeAddress(trimmedAddress)
      latitude = coords?.latitude ?? null
      longitude = coords?.longitude ?? null
      geocoded = !!coords
      geocodeMessage = coords
        ? `Coordenadas atualizadas: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
        : 'Morada guardada, mas coordenadas não encontradas.'
    }

    const restaurantData: any = {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(address !== undefined && { address: String(address).trim() }),
      ...(telephone !== undefined && {
        telephone: telephone?.trim() || null,
      }),
      ...(email !== undefined && { email: email?.trim() || null }),
      ...(website !== undefined && { website: website?.trim() || null }),
      ...(taxId !== undefined && { taxId: taxId?.trim() || null }),
      ...(logo !== undefined && { logo: logo?.trim() || null }),
    };

    if (address !== undefined) {
      restaurantData.latitude = latitude;
      restaurantData.longitude = longitude;
    }

    const restaurant = await adminFetcher<any>(`/api/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(restaurantData),
    })

    return NextResponse.json({
      ...restaurant,
      ...(geocodeMessage !== undefined && { geocoded, geocodeMessage }),
    })
  } catch (error) {
    console.error('[api/restaurants PATCH] error:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar restaurante' },
      { status: 500 }
    )
  }
}
