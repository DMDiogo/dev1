'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Label from '@/components/ui/Label'
import CategoryField from '@/components/products/CategoryField'
import { normalizeCategory } from '@/lib/product-categories'

type RestaurantOption = { id: string; name: string }

export default function NewProductButton({
  restaurants,
}: {
  restaurants: RestaurantOption[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const category = normalizeCategory(String(form.get('category') || ''))
    if (!category) {
      setError('Indique a categoria do produto.')
      setLoading(false)
      return
    }

    const payload = {
      name: String(form.get('name')).trim(),
      price: parseFloat(String(form.get('price'))),
      restaurantId: String(form.get('restaurantId')),
      taxPercentage: String(form.get('taxPercentage')),
      category,
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Erro ao criar produto')
      }

      setOpen(false)
      e.currentTarget.reset()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        disabled={restaurants.length === 0}
      >
        + Novo Produto
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Novo Produto"
        description="Adiciona um produto a um restaurante."
      >
        {restaurants.length === 0 ? (
          <p className="text-sm text-gray-400">
            Cria primeiro um restaurante antes de adicionar produtos.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="restaurantId">Restaurante *</Label>
              <Select id="restaurantId" name="restaurantId" required defaultValue="">
                <option value="" disabled>
                  Selecionar restaurante
                </option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" name="name" required placeholder="Ex: Pizza Margherita" />
            </div>
            <div>
              <Label htmlFor="price">Preço (Kz) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="2500"
              />
            </div>
            <CategoryField />
            <div>
              <Label htmlFor="taxPercentage">IVA</Label>
              <Select id="taxPercentage" name="taxPercentage" defaultValue="VAT_14">
                <option value="VAT_14">14%</option>
                <option value="VAT_7">7%</option>
                <option value="VAT_5">5%</option>
              </Select>
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
                {loading ? 'A guardar...' : 'Criar Produto'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
