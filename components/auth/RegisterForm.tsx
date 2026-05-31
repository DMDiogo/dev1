'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'
import PasswordStrength from '@/components/auth/PasswordStrength'

export default function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const pwd = String(form.get('password'))
    const confirm = String(form.get('confirmPassword'))

    if (pwd !== confirm) {
      setError('As palavras-passe não coincidem.')
      setLoading(false)
      return
    }

    const payload = {
      name: String(form.get('name')),
      email: String(form.get('email')),
      telephone: String(form.get('telephone')),
      password: pwd,
      role: 'RESTAURANT',
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao registar')

      router.push('/login?registered=1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="name">Nome completo *</Label>
        <Input id="name" name="name" required placeholder="O seu nome" />
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="nome@restaurante.ao"
        />
        <p className="text-xs text-gray-500 mt-1.5">
          Este email será o seu utilizador para iniciar sessão.
        </p>
      </div>

      <div>
        <Label htmlFor="telephone">Telefone *</Label>
        <Input
          id="telephone"
          name="telephone"
          required
          placeholder="+244 9XX XXX XXX"
        />
      </div>

      <div>
        <Label htmlFor="password">Palavra-passe *</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <PasswordStrength password={password} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirmar palavra-passe *</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          placeholder="Repita a palavra-passe"
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
        <input
          type="checkbox"
          required
          className="mt-0.5 rounded border-surface-border cursor-pointer"
        />
        Aceito os termos de utilização e política de privacidade.
      </label>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            A criar conta...
          </>
        ) : (
          'Criar conta'
        )}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Já tem conta?{' '}
        <Link
          href="/login"
          className="text-brand-500 hover:text-brand-400 font-medium cursor-pointer"
        >
          Iniciar sessão
        </Link>
      </p>
    </form>
  )
}
