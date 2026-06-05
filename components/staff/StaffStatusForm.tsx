'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Select from '@/components/ui/Select'

const STAFF_STATUSES = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'STAND_BY', label: 'Em análise' },
  { value: 'INACTIVE', label: 'Inactivo' },
] as const

export default function StaffStatusForm({
  userId,
  currentStatus,
}: {
  userId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handleChange(next: string) {
    setStatus(next)
    setLoading(true)

    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao actualizar estado')
      }

      router.refresh()
    } catch {
      setStatus(currentStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="min-w-[130px] text-xs py-1.5"
      aria-label="Estado do utilizador"
    >
      {STAFF_STATUSES.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  )
}
