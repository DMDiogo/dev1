'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Select from '@/components/ui/Select'

type Product = {
  id: string
  name: string
  description?: string | null
  price: number
  taxPercentage?: string | null
  status?: string | null
}

export default function EditProductModal({ product }: { product: Product }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const payload = {
      description: String(form.get('description') || '').trim(),
      price: parseFloat(String(form.get('price'))),
      taxPercentage: String(form.get('taxPercentage')),
      status: String(form.get('status')),
    }

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Erro ao guardar')
      }

      if (data._warning) {
        setNotice(data._warning)
        router.refresh()
        setLoading(false)
        return
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300"
      >
        <Pencil size={14} />
        Editar
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={`Editar: ${product.name}`}
        description="Preço, IVA, descrição e estado do produto"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor={`desc-${product.id}`}>Descrição</Label>
            <Input
              id={`desc-${product.id}`}
              name="description"
              defaultValue={product.description ?? ''}
              placeholder="Descrição do produto"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`price-${product.id}`}>Preço (Kz) *</Label>
              <Input
                id={`price-${product.id}`}
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={product.price}
              />
            </div>
            <div>
              <Label htmlFor={`tax-${product.id}`}>IVA *</Label>
              <Select
                id={`tax-${product.id}`}
                name="taxPercentage"
                defaultValue={product.taxPercentage ?? 'VAT_14'}
              >
                <option value="VAT_14">14%</option>
                <option value="VAT_7">7%</option>
                <option value="VAT_5">5%</option>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor={`status-${product.id}`}>Estado *</Label>
            <Select
              id={`status-${product.id}`}
              name="status"
              defaultValue={product.status ?? 'ACTIVE'}
            >
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </Select>
          </div>

          {notice && (
            <p className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              {notice}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

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
              {loading ? 'A guardar...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
