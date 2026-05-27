import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  canManageRestaurant,
  normalizeWorkingHours,
  type WorkingHourInput,
} from '@/lib/working-hours'
import { adminFetcher } from '@/lib/api/api_server_backend'

export const runtime = 'nodejs'

function parseHours(body: unknown): WorkingHourInput[] | null {
  if (!body || typeof body !== 'object' || !('hours' in body)) return null
  const hours = (body as { hours: unknown }).hours
  if (!Array.isArray(hours)) return null

  const validDays = new Set(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const)
  const parsed: WorkingHourInput[] = []

  for (const row of hours) {
    if (!row || typeof row !== 'object') continue
    const r = row as Record<string, unknown>
    if (!validDays.has(r.dayOfWeek as WorkingHourInput['dayOfWeek'])) continue
    parsed.push({
      dayOfWeek: r.dayOfWeek as WorkingHourInput['dayOfWeek'],
      startTime: String(r.startTime ?? '09:00'),
      endTime: String(r.endTime ?? '22:00'),
      isOpen: Boolean(r.isOpen),
    })
  }

  if (parsed.length === 0) return null
  return normalizeWorkingHours(parsed)
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  if (!canManageRestaurant(session.user, id)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const hours = await adminFetcher<WorkingHourInput[]>(`/api/restaurants/${id}/working-hours`)
    return NextResponse.json(hours)
  } catch (error) {
    console.error('[api/working-hours GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    if (!canManageRestaurant(session.user, id)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const restaurant = await adminFetcher<any>(`/api/restaurants/${id}`)
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      )
    }

    const hours = parseHours(await request.json())
    if (!hours) {
      return NextResponse.json(
        { error: 'Horários inválidos' },
        { status: 400 }
      )
    }

    const saved = await adminFetcher<WorkingHourInput[]>(`/api/restaurants/${id}/working-hours`, {
      method: 'PUT',
      body: JSON.stringify({ hours }),
    })

    return NextResponse.json({ hours: saved })
  } catch (error) {
    console.error('[api/working-hours PUT] error:', error)
    return NextResponse.json(
      { error: 'Erro ao guardar horários' },
      { status: 500 }
    )
  }
}
