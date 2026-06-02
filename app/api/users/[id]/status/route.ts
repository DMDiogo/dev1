import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateUserStatus } from '@/lib/api/api_server_backend'

export async function PATCH(
  request: Request,
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
    const body = await request.json()
    const status = String(body.status ?? '').trim()

    if (!status) {
      return NextResponse.json(
        { error: 'Estado é obrigatório' },
        { status: 400 }
      )
    }

    const user = await updateUserStatus(id, status)
    return NextResponse.json(user)
  } catch (error) {
    console.error('[api/users/[id]/status] PATCH error:', error)
    return NextResponse.json(
      { error: 'Não foi possível actualizar o estado' },
      { status: 500 }
    )
  }
}
