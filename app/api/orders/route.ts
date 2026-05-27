import { NextResponse } from 'next/server'
import { adminFetcher } from '@/lib/api/api_server_backend'

export async function GET() {
  try {
    const orders = await adminFetcher<any[]>('/api/orders')
    return NextResponse.json(orders)
  } catch (error) {
    console.error('[api/orders GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const order = await adminFetcher<any>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return NextResponse.json(order, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 400 }
    )
  }
}
