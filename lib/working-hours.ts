export type WeekDay = 
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export const WEEK_DAYS_ORDER: WeekDay[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
}

export type WorkingHourInput = {
  dayOfWeek: WeekDay
  startTime: string
  endTime: string
  isOpen: boolean
}

export const DEFAULT_WORKING_HOURS: WorkingHourInput[] = WEEK_DAYS_ORDER.map(
  (day) => ({
    dayOfWeek: day,
    startTime: '09:00',
    endTime: '22:00',
    isOpen: day !== 'SUNDAY',
  })
)

export function normalizeWorkingHours(
  hours: WorkingHourInput[]
): WorkingHourInput[] {
  const byDay = new Map(hours.map((h) => [h.dayOfWeek, h]))

  return WEEK_DAYS_ORDER.map((day) => {
    const row = byDay.get(day)
    return {
      dayOfWeek: day,
      startTime: row?.startTime?.trim() || '09:00',
      endTime: row?.endTime?.trim() || '22:00',
      isOpen: row?.isOpen ?? true,
    }
  })
}

export function mergeWithDefaults(
  existing: {
    dayOfWeek: WeekDay
    startTime: string
    endTime: string
    isOpen: boolean
  }[]
): WorkingHourInput[] {
  if (existing.length === 0) return DEFAULT_WORKING_HOURS
  return normalizeWorkingHours(existing)
}

export async function seedDefaultWorkingHours(
  tx: any, // Keeping parameter for compatibility but not using it
  restaurantId: string
) {
  // In a real implementation without Prisma, this would make an API call
  // For now, we'll just return since the backend should handle this
  return;
}

export function canManageRestaurant(
  user: { role: string; restaurantId?: string | null },
  restaurantId: string
) {
  if (user.role === 'ADMIN') return true
  if (user.role === 'RESTAURANT' && user.restaurantId === restaurantId) {
    return true
  }
  return false
}
