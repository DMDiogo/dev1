'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Select from '@/components/ui/Select'
import Label from '@/components/ui/Label'
import Button from '@/components/ui/Button'

const statuses = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'ACCEPTED', label: 'Aceite' },
  { value: 'ACCEPTED_DRIVER', label: 'Driver Aceite' },
  { value: 'PREPARING', label: 'A Preparar' },
  { value: 'READY_FOR_PICKUP', label: 'Pronto' },
  { value: 'PICKED_UP', label: 'Recolhido' },
  { value: 'IN_TRANSIT', label: 'Em Trânsito' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  async function handleUpdate() {
    if (status === currentStatus) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Erro ao atualizar estado')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar estado')
      setStatus(currentStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
      <div className="min-w-[200px]">
        <Label htmlFor="order-status">Alterar estado</Label>
        <Select
          id="order-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <Button
        type="button"
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        className="shrink-0"
      >
        {loading ? 'A guardar...' : 'Atualizar'}
      </Button>
      {error && <p className="text-sm text-red-400 sm:self-center">{error}</p>}
    </div>
  )
}
