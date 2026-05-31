import { NextResponse } from 'next/server'
import { publicFetcher } from '@/lib/api/api_server_backend'

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || ''

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

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      telephone: telephone.trim(),
      password,
      role: 'RESTAURANT',
    }

    const response = await fetch(`${BACKEND_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message =
        data.error ||
        data.message ||
        (response.status === 409
          ? 'Este email ou telefone já está registado'
          : 'Erro ao criar conta')

      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json({ user: data.user ?? data }, { status: 201 })
  } catch (error) {
    console.error('[register] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    )
  }
}
