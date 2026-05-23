'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/auth/Logo'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') router.replace('/')
  }, [status, router])

  if (status === 'loading') {
    return <p className="text-gray-500">A carregar...</p>
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <Logo size={48} href="/login" />
      </div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
        Criar conta
      </h1>
      <p className="text-gray-400 mt-1 mb-8">
        Registe-se como restaurante ou administrador
      </p>
      <RegisterForm />
    </div>
  )
}
