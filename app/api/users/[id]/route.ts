import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserById } from '@/lib/api/api_server_backend'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const user = await getUserById(id)

    return NextResponse.json(user)
  } catch (error) {
    console.error('[api/users/[id]] GET error:', error)
    return NextResponse.json(
      { error: 'Utilizador não encontrado' },
      { status: 404 }
    )
  }
}
