import { adminFetcher } from '@/lib/api/api_server_backend'

const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

function monthRange(year: number, month: number) {
  const start = new Date(year, month, 1, 0, 0, 0, 0)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export function formatChange(current: number, previous: number, suffix = '') {
  if (previous === 0) {
    if (current === 0) return `0${suffix}`
    return `+100%${suffix}`
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct}%${suffix}`
}

export async function getDashboardMetrics() {
  // Since we're moving away from Prisma, we'll fetch dashboard data from our new API endpoint
  const dashboardData = await adminFetcher<any>('/api/dashboard')
  return dashboardData
}

export async function getMonthlyRevenueChart() {
  // This function is no longer needed as the backend provides the data
  // We'll keep it for compatibility but return empty array
  return []
}
