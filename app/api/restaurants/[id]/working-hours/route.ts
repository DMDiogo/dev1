import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { WeekDay } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  canManageRestaurant,
  normalizeWorkingHours,
  type WorkingHourInput,
} from '@/lib/working-hours'

export const runtime = 'nodejs'

function parseHours(body: unknown): WorkingHourInput[] | null {
  if (!body || typeof body !== 'object' || !('hours' in body)) return null
  const hours = (body as { hours: unknown }).hours
  if (!Array.isArray(hours)) return null

  const validDays = new Set(Object.values(WeekDay))
  const parsed: WorkingHourInput[] = []

  for (const row of hours) {
    if (!row || typeof row !== 'object') continue
    const r = row as Record<string, unknown>
    if (!validDays.has(r.dayOfWeek as WeekDay)) continue
    parsed.push({
      dayOfWeek: r.dayOfWeek as WeekDay,
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

  const hours = await prisma.restaurantWorkingHour.findMany({
    where: { restaurantId: id },
    orderBy: { dayOfWeek: 'asc' },
  })

  return NextResponse.json(hours)
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

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      select: { id: true },
    })
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

    const saved = await prisma.$transaction(async (tx) => {
      await tx.restaurantWorkingHour.deleteMany({
        where: { restaurantId: id },
      })
      await tx.restaurantWorkingHour.createMany({
        data: hours.map((h) => ({
          restaurantId: id,
          dayOfWeek: h.dayOfWeek,
          startTime: h.startTime,
          endTime: h.endTime,
          isOpen: h.isOpen,
        })),
      })
      return tx.restaurantWorkingHour.findMany({
        where: { restaurantId: id },
        orderBy: { dayOfWeek: 'asc' },
      })
    })

    return NextResponse.json({ hours: saved })
  } catch (error) {
    console.error('[api/working-hours PUT]', error)
    return NextResponse.json(
      { error: 'Erro ao guardar horários' },
      { status: 500 }
    )
  }
}
