'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'
import PasswordStrength from '@/components/auth/PasswordStrength'
import { cn } from '@/lib/utils'

export default function RegisterForm() {
  const router = useRouter()
  const [accountType, setAccountType] = useState<'RESTAURANT' | 'ADMIN'>('RESTAURANT')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const password = String(form.get('password'))
    const confirm = String(form.get('confirmPassword'))

    if (password !== confirm) {
      setError('As palavras-passe não coincidem.')
      setLoading(false)
      return
    }

    const payload = {
      name: String(form.get('name')),
      email: String(form.get('email')),
      telephone: String(form.get('telephone')),
      password,
      role: accountType,
      adminCode:
        accountType === 'ADMIN' ? String(form.get('adminCode')) : undefined,
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao registar')

      const query =
        accountType === 'RESTAURANT' ? '?registered=1&role=restaurant' : '?registered=1'
      router.push(`/login${query}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-2 p-1 bg-surface rounded-xl border border-surface-border">
        {(
          [
            { id: 'RESTAURANT' as const, label: 'Restaurante' },
            { id: 'ADMIN' as const, label: 'Administrador' },
          ] as const
        ).map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setAccountType(type.id)}
            className={cn(
              'py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer',
              accountType === type.id
                ? 'bg-brand-500 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      {accountType === 'RESTAURANT' ? (
        <p className="text-sm text-gray-400 bg-surface border border-surface-border rounded-xl px-4 py-3 leading-relaxed">
          Cria a sua conta de gestor. Depois do registo, inicia sessão e
          regista o <strong className="text-white font-medium">seu</strong>{' '}
          restaurante, produtos e pedidos — dados só seus, separados de outros
          estabelecimentos.
        </p>
      ) : (
        <p className="text-sm text-gray-400 bg-surface border border-surface-border rounded-xl px-4 py-3 leading-relaxed">
          Administradores da plataforma veem todos os restaurantes e pedidos.
          É necessário o código de registo da equipa.
        </p>
      )}

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
          placeholder="nome@empresa.ao"
        />
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

      {accountType === 'ADMIN' && (
        <div>
          <Label htmlFor="adminCode">Código de administrador *</Label>
          <Input
            id="adminCode"
            name="adminCode"
            required
            placeholder="Código fornecido pela equipa"
          />
        </div>
      )}

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
        Aceito os termos de utilização e política de privacidade da plataforma.
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
