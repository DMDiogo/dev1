import { NextResponse } from 'next/server'
import { adminFetcher } from '@/lib/api/api_server_backend'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const order = await adminFetcher<any>(`/api/orders/${id}`)

  if (!order) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const { status } = await request.json()
    // Since we're moving away from Prisma, we'll assume the backend handles validation
    // In a real implementation, you might want to validate the status here
    
    const order = await adminFetcher<any>(`/api/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    return NextResponse.json(order)
  } catch {
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
      { status: 400 }
    )
  }
}
