import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadImageToBackend } from '@/lib/backend-image-upload'
import {
  getRestaurantRecord,
  patchRestaurantMerged,
} from '@/lib/restaurant-update'
import { normalizeLogoUrlInput } from '@/lib/restaurant-logo-storage'

export const runtime = 'nodejs'

async function assertCanEditRestaurant(
  restaurantId: string
): Promise<
  | { ok: true; accessToken: string }
  | { ok: false; status: number; error: string }
> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.accessToken) {
    return { ok: false, status: 401, error: 'Não autorizado' }
  }

  if (session.user.role === 'ADMIN') {
    return { ok: true, accessToken: session.user.accessToken }
  }

  if (
    session.user.role === 'RESTAURANT' &&
    session.user.restaurantId === restaurantId
  ) {
    return { ok: true, accessToken: session.user.accessToken }
  }

  return { ok: false, status: 403, error: 'Acesso negado' }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const access = await assertCanEditRestaurant(id)

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const logoUrl = normalizeLogoUrlInput(String(formData.get('logoUrl') ?? ''))

    let logoPath: string | null = null

    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadImageToBackend(
        file,
        file.name || 'logo.jpg',
        access.accessToken
      )
      logoPath = uploaded.imageUrl
    } else if (logoUrl) {
      logoPath = logoUrl
    } else {
      return NextResponse.json(
        { error: 'Seleccione uma imagem ou indique um URL/caminho.' },
        { status: 400 }
      )
    }

    const current = await getRestaurantRecord(id)
    const restaurant = await patchRestaurantMerged(id, current, { logo: logoPath })

    return NextResponse.json({
      restaurant,
      logo: restaurant.logo ?? logoPath,
      message: 'Logo guardado com sucesso.',
    })
  } catch (error) {
    console.error('[api/restaurants/logo POST]', error)
    const message =
      error instanceof Error ? error.message : 'Erro ao guardar logo'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const access = await assertCanEditRestaurant(id)

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  try {
    const current = await getRestaurantRecord(id)
    const restaurant = await patchRestaurantMerged(id, current, { logo: null })

    return NextResponse.json({
      restaurant,
      logo: null,
      message: 'Logo removido.',
    })
  } catch (error) {
    console.error('[api/restaurants/logo DELETE]', error)
    return NextResponse.json(
      { error: 'Erro ao remover logo' },
      { status: 500 }
    )
  }
}
