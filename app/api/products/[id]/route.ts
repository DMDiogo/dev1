import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adminFetcher, getApiBaseUrl } from '@/lib/api/api_server_backend'

export const runtime = 'nodejs'

const VALID_TAX = new Set(['VAT_14', 'VAT_7', 'VAT_5'])
const VALID_STATUS = new Set(['ACTIVE', 'INACTIVE', 'STAND_BY'])

async function putProductToBackend(
  id: string,
  accessToken: string,
  fields: Record<string, string>
) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== '') {
      formData.append(key, value)
    }
  }

  const response = await fetch(`${getApiBaseUrl()}/api/products/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
    cache: 'no-store',
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail =
      typeof data.details === 'string' ? data.details : undefined
    throw new Error(
      detail || data.error || `Erro API (${response.status})`
    )
  }
  return data
}

/** Campos que a API remota aceita hoje (status/taxPercentage falham no servidor actual). */
const RISKY_API_FIELDS = new Set(['status', 'taxPercentage'])

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'RESTAURANT') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const fields: Record<string, string> = {}

    if (body.name !== undefined) fields.name = String(body.name).trim()
    if (body.description !== undefined) {
      fields.description = String(body.description).trim()
    }
    if (body.price !== undefined) fields.price = String(Number(body.price))
    if (body.category !== undefined) fields.category = String(body.category).trim()
    if (body.taxPercentage !== undefined) {
      const tax = String(body.taxPercentage)
      if (!VALID_TAX.has(tax)) {
        return NextResponse.json({ error: 'IVA inválido' }, { status: 400 })
      }
      fields.taxPercentage = tax
    }
    if (body.status !== undefined) {
      const status = String(body.status)
      if (!VALID_STATUS.has(status)) {
        return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
      }
      fields.status = status
    }

    if (Object.keys(fields).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para actualizar' },
        { status: 400 }
      )
    }

    if (session.user.role === 'RESTAURANT') {
      const existing = await adminFetcher<any>(`/api/products/${id}`)
      if (existing.restaurantId !== session.user.restaurantId) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    const product = await putProductToBackend(
      id,
      session.user.accessToken,
      fields
    ).catch(async (firstError) => {
      const hasRisky = Object.keys(fields).some((k) => RISKY_API_FIELDS.has(k))
      if (!hasRisky) throw firstError

      const safeFields = Object.fromEntries(
        Object.entries(fields).filter(([k]) => !RISKY_API_FIELDS.has(k))
      )

      if (Object.keys(safeFields).length === 0) throw firstError

      const updated = await putProductToBackend(
        id,
        session.user.accessToken,
        safeFields
      )

      const skipped = Object.keys(fields).filter((k) => RISKY_API_FIELDS.has(k))
      return {
        ...updated,
        _warning: `Preço/descrição guardados. A API remota ainda não aceita: ${skipped.join(', ')}. Actualize o servidor (migration status + fix IVA).`,
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('[api/products/[id] PUT]', error)
    const message =
      error instanceof Error ? error.message : 'Erro ao actualizar produto'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
