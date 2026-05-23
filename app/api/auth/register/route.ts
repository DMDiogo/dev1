import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, telephone, role } = body

    if (!name?.trim() || !email?.trim() || !password || !telephone?.trim()) {
      return NextResponse.json(
        { error: 'Preenche todos os campos obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A palavra-passe deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    if (role !== 'RESTAURANT') {
      return NextResponse.json(
        { error: 'Registo disponível apenas para restaurantes' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { telephone: telephone.trim() },
        ],
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email ou telefone já registado' },
        { status: 409 }
      )
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        telephone: telephone.trim(),
        password: hashed,
        role: 'RESTAURANT',
        restaurantId: null,
      },
      select: { id: true, email: true, role: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
