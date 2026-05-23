'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/auth/Logo'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') router.replace('/')
  }, [status, router])

  return (
    <>
      <div className="mb-8">
        <Logo size={48} href="/login" />
      </div>
      <h1 className="font-display text-2xl font-bold text-white">
        Recuperar palavra-passe
      </h1>
      <p className="text-gray-400 mt-1 mb-8">
        Introduza o email associado à sua conta
      </p>
      <ForgotPasswordForm />
    </>
  )
}
