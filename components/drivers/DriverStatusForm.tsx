'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Label from '@/components/ui/Label'
import {
  DRIVER_ACCOUNT_STATUSES,
  driverIsInTransit,
} from '@/lib/driver-status'

export default function DriverStatusForm({
  driverId,
  currentStatus,
  orders,
}: {
  driverId: string
  currentStatus: string
  orders?: { status?: string }[]
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onDelivery = driverIsInTransit(orders)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch(`/api/users/${driverId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao actualizar estado')
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {onDelivery && (
        <p className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          Este motorista está em entrega (IN_TRANSIT). O estado da conta só pode
          ser alterado quando a entrega não estiver em trânsito.
        </p>
      )}

      <div>
        <Label htmlFor="driverStatus">Estado da conta</Label>
        <Select
          id="driverStatus"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={onDelivery || loading}
        >
          {DRIVER_ACCOUNT_STATUSES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-400">Estado actualizado com sucesso.</p>
      )}

      <Button type="submit" disabled={onDelivery || loading}>
        {loading ? 'A guardar...' : 'Guardar estado'}
      </Button>
    </form>
  )
}
