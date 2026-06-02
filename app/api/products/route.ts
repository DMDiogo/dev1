import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adminFetcher } from '@/lib/api/api_server_backend'
import { normalizeCategory } from '@/lib/product-categories'
import { unwrapList } from '@/lib/restaurant-data'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')

    let endpoint = '/api/products'
    if (restaurantId) {
      endpoint += `?restaurantId=${restaurantId}`
    }

    const products = unwrapList(await adminFetcher<any[]>(endpoint))
    return NextResponse.json(products)
  } catch (error) {
    console.error('[api/products GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    let { name, price, restaurantId, taxPercentage, category } = body

    if (session.user.role === 'RESTAURANT') {
      if (!session.user.restaurantId) {
        return NextResponse.json({ error: 'Sem restaurante' }, { status: 403 })
      }
      restaurantId = session.user.restaurantId
    }

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

    // Since we're moving away from Prisma, we'll assume the backend handles tax validation
    const tax = taxPercentage || 'VAT_14' // Default value

    const normalizedCategory = normalizeCategory(String(category || ''))
    if (!normalizedCategory) {
      return NextResponse.json(
        { error: 'Categoria é obrigatória' },
        { status: 400 }
      )
    }

    const productData = {
      name: name.trim(),
      price,
      restaurantId,
      taxPercentage: tax,
      category: normalizedCategory,
    }

    const product = await adminFetcher<any>('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })

    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 400 }
    )
  }
}
