// app/api/test-login/route.ts
import { NextResponse } from 'next/server'
import { authenticateWithBackend } from '@/lib/authenticate'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const result = await authenticateWithBackend(email, password)

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    })
  } catch (error) {
    console.error('[Test Login] Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}