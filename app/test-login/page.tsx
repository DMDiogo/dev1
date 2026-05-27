// app/test-login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@foodadmin.ao')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    
    console.log('Attempting login with:', email)
    
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      console.log('SignIn result:', res)
      setResult(res)
      
      if (res?.ok) {
        // Wait a bit for session to be set
        setTimeout(async () => {
          try {
            const sessionRes = await fetch('/api/auth/session')
            const session = await sessionRes.json()
            console.log('Session after login:', session)
            setResult((prev: any) => ({ ...prev, session }))
            
            // Also check debug session
            const debugRes = await fetch('/api/debug-session')
            const debug = await debugRes.json()
            console.log('Debug session:', debug)
            setResult((prev: any) => ({ ...prev, debug }))
          } catch (error) {
            console.error('Error fetching session:', error)
          }
        }, 1000)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const checkSession = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()
      console.log('Current session:', session)
      
      const debugRes = await fetch('/api/debug-session')
      const debug = await debugRes.json()
      console.log('Debug session:', debug)
      
      setResult({ currentSession: session, debug })
    } catch (error: any) {
      console.error('Error checking session:', error)
      setResult({ error: error.message })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-bold text-center">Test Login</h1>
          <p className="text-center text-gray-600 mt-2">Debug authentication issues</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div>
          <button
            onClick={checkSession}
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Check Current Session
          </button>
        </div>
        
        {result && (
          <div className="mt-4">
            <h3 className="text-lg font-medium">Result:</h3>
            <pre className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto max-h-96 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}