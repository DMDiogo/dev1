'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'

export default function NewRestaurantButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const payload = {
      name: String(form.get('name')).trim(),
      address: String(form.get('address')).trim(),
      telephone: String(form.get('telephone') || '').trim() || undefined,
      email: String(form.get('email') || '').trim() || undefined,
      taxId: String(form.get('taxId') || '').trim() || undefined,
    }

    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Erro ao criar restaurante')
      }

      setOpen(false)
      e.currentTarget.reset()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar restaurante')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        + Novo Restaurante
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Novo Restaurante"
        description="Preenche os dados para registar um restaurante."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" name="name" required placeholder="Ex: Restaurante Luanda" />
          </div>
          <div>
            <Label htmlFor="address">Morada *</Label>
            <Input id="address" name="address" required placeholder="Rua, bairro, cidade" />
          </div>
          <div>
            <Label htmlFor="telephone">Telefone</Label>
            <Input id="telephone" name="telephone" placeholder="+244 9XX XXX XXX" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="contacto@restaurante.ao" />
          </div>
          <div>
            <Label htmlFor="taxId">NIF</Label>
            <Input id="taxId" name="taxId" placeholder="Número de contribuinte" />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'A guardar...' : 'Criar Restaurante'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
