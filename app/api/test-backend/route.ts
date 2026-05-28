// app/api/test-backend/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://aodelivery-api.angolaerp.co.ao'
  
  try {
    console.log('[Test] Testing connection to:', `${BACKEND_API_URL}/api/auth/login`);
    
    const response = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@foodadmin.ao',
        password: 'admin123', // Replace with actual password
      }),
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      hasLoginToken: !!data.loginToken,
      responseKeys: Object.keys(data),
      data: data
    });
  } catch (error: unknown) {
    console.error('[Test] Error:', error);
    
    // Properly handle unknown error type
    let errorMessage = 'Unknown error occurred';
    let errorStack = undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
      
      // Check for specific fetch errors
      if (error.message.includes('fetch')) {
        errorMessage = `Network error: ${error.message}. Cannot reach backend at ${BACKEND_API_URL}`;
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = `Connection refused: Backend server at ${BACKEND_API_URL} is not running or unreachable`;
      } else if (error.message.includes('CERT')) {
        errorMessage = `SSL Certificate error: Backend SSL certificate may be invalid`;
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: errorStack,
      backendUrl: BACKEND_API_URL,
      tip: "Make sure the backend API is running and accessible from your Next.js server"
    }, { status: 500 });
  }
}