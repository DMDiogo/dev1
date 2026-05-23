import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Pedido de recuperação — resposta genérica por segurança */
export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })
    }

    await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // Em produção: enviar email com token. Por agora apenas confirmação genérica.
    return NextResponse.json({
      message: 'Se o email existir, enviaremos instruções.',
    })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao processar pedido' },
      { status: 500 }
    )
  }
}
