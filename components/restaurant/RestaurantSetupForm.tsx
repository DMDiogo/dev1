'use client'

import { useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'

export default function RestaurantSetupForm() {
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

      window.location.assign('/restaurant/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registar restaurante')
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="name">Nome do restaurante *</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Ex: Restaurante Kilamba"
        />
      </div>

      <div>
        <Label htmlFor="address">Morada completa *</Label>
        <Input
          id="address"
          name="address"
          required
          placeholder="Rua, bairro, cidade — ex: Talatona, Luanda"
        />
        <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1.5">
          <MapPin size={14} className="shrink-0 mt-0.5" />
          Usamos a morada para obter coordenadas GPS automaticamente.
        </p>
      </div>

      <div>
        <Label htmlFor="telephone">Telefone do restaurante</Label>
        <Input
          id="telephone"
          name="telephone"
          placeholder="+244 9XX XXX XXX"
        />
      </div>

      <div>
        <Label htmlFor="email">Email do restaurante</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="contacto@restaurante.ao"
        />
      </div>

      <div>
        <Label htmlFor="taxId">NIF</Label>
        <Input id="taxId" name="taxId" placeholder="Número de contribuinte" />
      </div>

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
  )
}
