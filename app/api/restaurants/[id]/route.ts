import { fetcher } from '@/lib/api/api_server_backend'
import { NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/geocode'


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

    if (address !== undefined) {
      const trimmedAddress = String(address).trim()
      const coords = await geocodeAddress(trimmedAddress)
      latitude = coords?.latitude ?? null
      longitude = coords?.longitude ?? null
    }

    const updateData: any = {}
    
    if (name !== undefined) updateData.name = String(name).trim()
    if (address !== undefined) {
      updateData.address = String(address).trim()
      if (latitude !== undefined && longitude !== undefined) {
        updateData.latitude = latitude
        updateData.longitude = longitude
      }
    }
    if (telephone !== undefined) updateData.telephone = telephone?.trim() || null
    if (email !== undefined) updateData.email = email?.trim() || null
    if (website !== undefined) updateData.website = website?.trim() || null
    if (taxId !== undefined) updateData.taxId = taxId?.trim() || null
    if (logo !== undefined) updateData.logo = logo?.trim() || null

    const restaurant = await fetcher<any>(`/api/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    })

    return NextResponse.json(restaurant)
  } catch (error) {
    console.error('[api/restaurants PATCH]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar restaurante' },
      { status: 400 }
    )
  }
}
