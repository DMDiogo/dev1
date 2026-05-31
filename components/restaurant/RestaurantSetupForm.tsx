'use client'

import { useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Building2, Loader2, Mail, MapPin, Phone, Receipt } from 'lucide-react'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'

export default function RestaurantSetupForm() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const accountEmail = session?.user?.email ?? ''
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [geocodeNote, setGeocodeNote] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setGeocodeNote(null)
    setLoading(true)

    const form = formRef.current
    if (!form) {
      setLoading(false)
      return
    }

    const formData = new FormData(form)
    const payload = {
      name: String(formData.get('name')).trim(),
      address: String(formData.get('address')).trim(),
      telephone: String(formData.get('telephone') || '').trim() || undefined,
      email: String(formData.get('email') || '').trim() || undefined,
      taxId: String(formData.get('taxId') || '').trim() || undefined,
    }

    try {
      const res = await fetch('/api/restaurant/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Erro ao registar restaurante')
      }

      if (data.geocodeMessage) {
        setGeocodeNote(data.geocodeMessage)
      }

      await update({
        restaurantId: data.restaurant.id,
        restaurantName: data.restaurant.name,
        restaurantStatus: data.restaurant.status ?? 'STAND_BY',
        needsSetup: false,
      })

      router.push('/restaurant/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registar restaurante')
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-xl shadow-black/20">
      <div className="px-6 py-5 border-b border-surface-border bg-gradient-to-r from-brand-500/10 via-transparent to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
            <Building2 size={20} className="text-brand-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Passo 2 de 2</p>
            <p className="text-xs text-gray-500">Dados do estabelecimento</p>
          </div>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Identificação
          </p>
          <div>
            <Label htmlFor="name">Nome do restaurante *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Ex: Restaurante Kilamba"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-surface-border/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Localização
          </p>
          <div>
            <Label htmlFor="address">Morada completa *</Label>
            <Input
              id="address"
              name="address"
              required
              placeholder="Rua, bairro, cidade — ex: Talatona, Luanda"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
              <MapPin size={14} className="shrink-0 mt-0.5 text-brand-500/80" />
              Usamos a morada para obter coordenadas GPS automaticamente.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-surface-border/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Contacto e fiscal
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telephone">Telefone</Label>
              <div className="relative">
                <Phone
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <Input
                  id="telephone"
                  name="telephone"
                  placeholder="+244 9XX XXX XXX"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email do restaurante</Label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  readOnly
                  defaultValue={accountEmail}
                  className="pl-9 opacity-80 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Usamos o mesmo email da sua conta para associar o restaurante
                após o login.
              </p>
            </div>
          </div>
          <div>
            <Label htmlFor="taxId">NIF</Label>
            <div className="relative">
              <Receipt
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <Input
                id="taxId"
                name="taxId"
                placeholder="Número de contribuinte"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 leading-relaxed">
          Após o registo, o restaurante ficará em análise até um administrador
          validar os dados. Pode aceder ao painel normalmente enquanto aguarda
          aprovação.
        </p>

        {geocodeNote && (
          <p className="text-sm text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            {geocodeNote}
          </p>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              A guardar...
            </>
          ) : (
            'Criar restaurante e continuar'
          )}
        </Button>
      </form>
    </div>
  )
}
