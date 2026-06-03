'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import RestaurantLogoUpload from '@/components/restaurants/RestaurantLogoUpload'

const emptyForm = {
  name: '',
  address: '',
  telephone: '',
  email: '',
  taxId: '',
}

export default function NewRestaurantButton() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createdRestaurantId, setCreatedRestaurantId] = useState<string | null>(
    null
  )
  const [createdRestaurantName, setCreatedRestaurantName] = useState('')

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setError(null)
      setSuccess(null)
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
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
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Erro ao criar restaurante')
      }

      const newId = data.id ?? data.restaurant?.id
      setCreatedRestaurantId(newId ?? null)
      setCreatedRestaurantName(payload.name)
      setSuccess(
        data.geocodeMessage ??
          (data.geocoded
            ? 'Restaurante criado com coordenadas GPS.'
            : 'Restaurante criado. Pode adicionar o logo abaixo.')
      )
      setLoading(false)
      router.refresh()

      if (!newId) {
        setTimeout(() => {
          setFormKey((k) => k + 1)
          setOpen(false)
          setSuccess(null)
          setCreatedRestaurantId(null)
          setCreatedRestaurantName('')
        }, 2800)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar restaurante')
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
        onOpenChange={handleOpenChange}
        title="Novo Restaurante"
        description="A morada será usada para obter latitude e longitude automaticamente."
      >
        <form
          key={formKey}
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={emptyForm.name}
              placeholder="Ex: Restaurante Luanda"
            />
          </div>
          <div>
            <Label htmlFor="address">Morada *</Label>
            <Input
              id="address"
              name="address"
              required
              defaultValue={emptyForm.address}
              placeholder="Ex: Talatona, Luanda, Angola"
            />
            <p className="text-xs text-gray-500 mt-1">
              Inclui bairro e cidade (ex: Talatona, Luanda, Angola).
            </p>
          </div>
          <div>
            <Label htmlFor="telephone">Telefone</Label>
            <Input
              id="telephone"
              name="telephone"
              defaultValue={emptyForm.telephone}
              placeholder="+244 9XX XXX XXX"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={emptyForm.email}
              placeholder="contacto@restaurante.ao"
            />
          </div>
          <div>
            <Label htmlFor="taxId">NIF</Label>
            <Input
              id="taxId"
              name="taxId"
              defaultValue={emptyForm.taxId}
              placeholder="Número de contribuinte"
            />
          </div>

          {createdRestaurantId && (
            <div className="pt-2 border-t border-surface-border">
              <p className="text-sm text-gray-400 mb-3">Logo (opcional)</p>
              <RestaurantLogoUpload
                restaurantId={createdRestaurantId}
                restaurantName={createdRestaurantName || 'Restaurante'}
                showUrlField
              />
              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setFormKey((k) => k + 1)
                    setOpen(false)
                    setSuccess(null)
                    setCreatedRestaurantId(null)
                    setCreatedRestaurantName('')
                  }}
                >
                  Concluir
                </Button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              {success}
            </p>
          )}

          {!createdRestaurantId && (
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'A obter localização...' : 'Criar Restaurante'}
              </Button>
            </div>
          )}
        </form>
      </Modal>
    </>
  )
}
