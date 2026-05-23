import { Suspense } from 'react'
import Logo from '@/components/auth/Logo'
import LoginForm from '@/components/auth/LoginForm'
import AuthRedirect from '@/components/auth/AuthRedirect'

export default function LoginPage() {
  return (
    <>
      <AuthRedirect />
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Logo size={48} href="/login" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Bem-vindo de volta
        </h1>
        <p className="text-gray-400 mt-1 mb-8">
          Inicie sessão na sua conta FoodAdmin
        </p>
        <Suspense fallback={<p className="text-gray-500">A carregar...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </>
  )
}
