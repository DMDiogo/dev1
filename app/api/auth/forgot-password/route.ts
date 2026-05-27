import { NextResponse } from 'next/server'

/** Pedido de recuperação — resposta genérica por segurança */
export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })
    }

    // Since we're moving away from Prisma, we'll call the backend API to check if user exists
    // For security, we still return a generic response regardless of whether the email exists
    try {
      await adminFetcher<any>(`/api/auth/forgot-password`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      }, false) // Don't require auth for forgot password
    } catch (apiError) {
      // Ignore API errors for security - still return success message
    }

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
