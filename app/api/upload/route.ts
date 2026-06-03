import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadImageToBackend } from '@/lib/backend-image-upload'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') ?? formData.get('image')

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: 'Nenhuma imagem enviada' },
        { status: 400 }
      )
    }

    const result = await uploadImageToBackend(
      file,
      file.name || 'logo.jpg',
      session.user.accessToken
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('[api/upload]', error)
    const message =
      error instanceof Error ? error.message : 'Erro ao enviar imagem'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
