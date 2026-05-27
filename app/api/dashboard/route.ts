import { NextResponse } from 'next/server'
import { adminFetcher } from '@/lib/api/api_server_backend'

export async function GET() {
  try {
    // Since we're moving away from Prisma, we'll fetch dashboard data from our new API endpoint
    const dashboardData = await adminFetcher<any>('/api/dashboard')
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('[api/dashboard GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
