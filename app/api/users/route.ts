import { NextResponse } from 'next/server'
import { adminFetcher } from '@/lib/api/api_server_backend'
import { unwrapList } from '@/lib/restaurant-data'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    // Get the session to check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let endpoint = '/api/users'
    if (role) {
      endpoint += `?role=${role}`
    }

    // adminFetcher expects only 2 arguments: endpoint and options
    // It will automatically use the JWT token from the session
    const users = unwrapList(
      await adminFetcher<any[]>(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      })
    )

    return NextResponse.json(users)
  } catch (error) {
    console.error('[api/users] error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}