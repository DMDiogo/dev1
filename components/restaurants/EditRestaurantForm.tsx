'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'

type RestaurantData = {
  id: string
  name: string
  address: string
  telephone: string | null
  email: string | null
  website: string | null
  taxId: string | null
}

export default function EditRestaurantForm({
  restaurant,
}: {
  restaurant: RestaurantData
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const payload = {
      name: String(form.get('name')).trim(),
      address: String(form.get('address')).trim(),
      telephone: String(form.get('telephone') || '').trim() || null,
      email: String(form.get('email') || '').trim() || null,
      website: String(form.get('website') || '').trim() || null,
      taxId: String(form.get('taxId') || '').trim() || null,
    }

    try {
      const res = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Erro ao guardar alterações')
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Editar restaurante">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-name">Nome *</Label>
            <Input
              id="edit-name"
              name="name"
              required
              defaultValue={restaurant.name}
            />
          </div>
          <div>
            <Label htmlFor="edit-address">Morada *</Label>
            <Input
              id="edit-address"
              name="address"
              required
              defaultValue={restaurant.address}
            />
          </div>
          <div>
            <Label htmlFor="edit-telephone">Telefone</Label>
            <Input
              id="edit-telephone"
              name="telephone"
              defaultValue={restaurant.telephone ?? ''}
            />
          </div>
          <div>
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              name="email"
              type="email"
              defaultValue={restaurant.email ?? ''}
            />
          </div>
          <div>
            <Label htmlFor="edit-website">Website</Label>
            <Input
              id="edit-website"
              name="website"
              defaultValue={restaurant.website ?? ''}
            />
          </div>
          <div>
            <Label htmlFor="edit-taxId">NIF</Label>
            <Input
              id="edit-taxId"
              name="taxId"
              defaultValue={restaurant.taxId ?? ''}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && (
          <p className="text-sm text-green-400">Alterações guardadas com sucesso.</p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? 'A guardar...' : 'Guardar alterações'}
        </Button>
      </form>
    </Card>
  )
}
