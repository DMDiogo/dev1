// app/api/debug-session/route.ts
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  return NextResponse.json({
    hasSession: !!session,
    hasUser: !!session?.user,
    hasAccessToken: !!session?.user?.accessToken,
    userId: session?.user?.id,
    userRole: session?.user?.role,
    sessionKeys: session ? Object.keys(session) : [],
    userKeys: session?.user ? Object.keys(session.user) : [],
  })
}