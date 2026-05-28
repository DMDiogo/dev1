// app/api/debug-backend/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://aodelivery-api.angolaerp.co.ao'
  
  try {
    const body = await request.json()
    const { email, password } = body
    
    console.log('[Debug] Testing backend connection to:', `${BACKEND_API_URL}/api/auth/login`)
    console.log('[Debug] With email:', email)
    
    const startTime = Date.now()
    
    const response = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    const endTime = Date.now()
    console.log('[Debug] Request took:', endTime - startTime, 'ms')
    console.log('[Debug] Response status:', response.status)
    console.log('[Debug] Response status text:', response.statusText)
    
    // Log all response headers
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })
    console.log('[Debug] Response headers:', headers)
    
    let data
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
      console.log('[Debug] Response data type: JSON')
      console.log('[Debug] Response data keys:', Object.keys(data))
      console.log('[Debug] Response data:', JSON.stringify(data, null, 2))
    } else {
      const text = await response.text()
      console.log('[Debug] Response data type: TEXT')
      console.log('[Debug] Response text:', text.substring(0, 500))
      data = { rawText: text }
    }
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      duration: endTime - startTime,
      headers,
      data,
      backendUrl: `${BACKEND_API_URL}/api/auth/login`,
    })
    
  } catch (error: unknown) {
    console.error('[Debug] Error testing backend:', error)
    
    let errorMessage = 'Unknown error'
    let errorDetails = {}
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = {
        name: error.name,
        stack: error.stack,
        cause: error.cause,
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      backendUrl: `${BACKEND_API_URL}/api/auth/login`,
    }, { status: 500 })
  }
}