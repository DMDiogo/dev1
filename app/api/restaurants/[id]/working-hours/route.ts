// app/api/restaurants/[id]/working-hours/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fetcher } from '@/lib/api/api_server_backend'
import {
  canManageRestaurant,
  normalizeWorkingHours,
  type WorkingHourInput,
} from '@/lib/working-hours'

type WeekDay = 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'

export const runtime = 'nodejs'

function parseHours(body: unknown): WorkingHourInput[] | null {
  if (!body || typeof body !== 'object' || !('hours' in body)) return null
  const hours = (body as { hours: unknown }).hours
  if (!Array.isArray(hours)) return null

  const validDays = new Set<WeekDay>(['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'])
  const parsed: WorkingHourInput[] = []

  for (const row of hours) {
    if (!row || typeof row !== 'object') continue
    const r = row as Record<string, unknown>
    const dayOfWeek = r.dayOfWeek as string
    if (!validDays.has(dayOfWeek as WeekDay)) continue
    parsed.push({
      dayOfWeek: dayOfWeek as WeekDay,
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
  
  // Check if user can manage this restaurant
  const canManage = session.user.role === 'ADMIN' || 
                   (session.user.role === 'RESTAURANT' && session.user.restaurantId === id)
  
  if (!canManage) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    // Fetch working hours from the dedicated backend endpoint
    const workingHours = await fetcher<any>(`/api/restaurants/${id}/working-hours`, {}, false)
    return NextResponse.json(workingHours || [])
  } catch (error) {
    console.error('[GET working-hours] Error:', error)
    // Return empty array if no working hours found
    return NextResponse.json([])
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
    
    // Check authorization
    const canManage = session.user.role === 'ADMIN' || 
                     (session.user.role === 'RESTAURANT' && session.user.restaurantId === id)
    
    if (!canManage) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const hours = parseHours(body)
    
    if (!hours) {
      return NextResponse.json(
        { error: 'Horários inválidos' },
        { status: 400 }
      )
    }

    // Format hours for backend - convert isOpen to the format backend expects
    const formattedHours = hours.map(h => ({
      dayOfWeek: h.dayOfWeek,
      startTime: h.startTime,
      endTime: h.endTime,
      isOpen: h.isOpen  // Backend uses 'isOpen' (not 'isClosed')
    }))

    // Use the dedicated working-hours endpoint on your backend
    const updatedWorkingHours = await fetcher<any>(`/api/restaurants/${id}/working-hours`, {
      method: 'PATCH',  // Your backend uses PATCH for working hours
      body: JSON.stringify({ workingHours: formattedHours }),
    }, true)  // Requires authentication

    return NextResponse.json({ hours: updatedWorkingHours })
  } catch (error) {
    console.error('[api/working-hours PUT]', error)
    return NextResponse.json(
      { error: 'Erro ao guardar horários' },
      { status: 500 }
    )
  }
}