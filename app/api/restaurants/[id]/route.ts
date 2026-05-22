import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      workingHours: true,
      paymentMethods: true,
      products: true,
    },
  })

  if (!restaurant) {
    return NextResponse.json(
      { error: 'Restaurante não encontrado' },
      { status: 404 }
    )
  }

  return NextResponse.json(restaurant)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { name, address, telephone, email, website, taxId, logo } = body

    if (name !== undefined && !String(name).trim()) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
    }
    if (address !== undefined && !String(address).trim()) {
      return NextResponse.json({ error: 'Morada inválida' }, { status: 400 })
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(address !== undefined && { address: String(address).trim() }),
        ...(telephone !== undefined && {
          telephone: telephone?.trim() || null,
        }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(website !== undefined && { website: website?.trim() || null }),
        ...(taxId !== undefined && { taxId: taxId?.trim() || null }),
        ...(logo !== undefined && { logo: logo?.trim() || null }),
      },
    })

    return NextResponse.json(restaurant)
  } catch {
    return NextResponse.json(
      { error: 'Erro ao atualizar restaurante' },
      { status: 400 }
    )
  }
}
