import { NextResponse } from 'next/server'
import { adminFetcher } from '@/lib/api/api_server_backend'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let endpoint = '/api/users'
    if (role) {
      endpoint += `?role=${role}`
    }

    const users = await adminFetcher<any[]>(endpoint, {}, true)
    return NextResponse.json(users)
  } catch (error) {
    console.error('[api/users] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
