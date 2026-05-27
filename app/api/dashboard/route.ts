import { NextResponse } from 'next/server'
import { adminFetcher } from '@/lib/api/api_server_backend'

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


export async function GET() {
  try {
    console.log('[Dashboard API] Starting request')
    const session = await getServerSession(authOptions)

    console.log('[Dashboard API] Session exists:', !!session)
    console.log('[Dashboard API] User exists:', !!session?.user)
    console.log('[Dashboard API] Access token exists:', !!session?.user?.accessToken)
    
    if (!session?.user?.accessToken) {
      console.error('[Dashboard API] No access token, returning 401')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }    

    // Try to use the token
    let response = await fetch(`${process.env.BACKEND_URL}/api/dashboard`, {
      headers: { 'Authorization': `Bearer ${session.user.accessToken}` }
    });
    
    // If token is invalid, refresh it
    if (response.status === 403) {
      const refreshResponse = await fetch(`${process.env.BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.user.accessToken}` }
      });
      
      if (refreshResponse.ok) {
        const { newToken } = await refreshResponse.json();
        // Update session with new token (you'll need to implement this)
        // Then retry the dashboard request
      }
    }

    // Since we're moving away from Prisma, we'll fetch dashboard data from our new API endpoint
    const dashboardData = await adminFetcher<any>('/api/dashboard')
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('[api/dashboard GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
