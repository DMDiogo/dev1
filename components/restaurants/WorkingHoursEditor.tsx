'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { WeekDay } from '@/lib/working-hours'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import {
  WEEK_DAY_LABELS,
  WEEK_DAYS_ORDER,
  type WorkingHourInput,
} from '@/lib/working-hours'

type Props = {
  restaurantId: string
  initialHours: WorkingHourInput[]
  readOnly?: boolean
}

export default function WorkingHoursEditor({
  restaurantId,
  initialHours,
  readOnly = false,
}: Props) {
  const router = useRouter()
  const [hours, setHours] = useState<WorkingHourInput[]>(initialHours)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function updateDay(day: WeekDay, patch: Partial<WorkingHourInput>) {
    setHours((prev) =>
      prev.map((row) => (row.dayOfWeek === day ? { ...row, ...patch } : row))
    )
  }

  async function handleSave() {
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/working-hours`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hours }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao guardar horários')

      setSuccess('Horários guardados.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Horário de funcionamento">
      <p className="text-sm text-gray-400 mb-4">
        Defina quando o restaurante está aberto em cada dia da semana.
      </p>

      <div className="space-y-3">
        {WEEK_DAYS_ORDER.map((day) => {
          const row = hours.find((h) => h.dayOfWeek === day)!
          return (
            <div
              key={day}
              className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-surface-border last:border-0"
            >
              <label className="flex items-center gap-2 sm:w-44 shrink-0 cursor-pointer">
                <input
                  type="checkbox"
                  checked={row.isOpen}
                  disabled={readOnly}
                  onChange={(e) =>
                    updateDay(day, { isOpen: e.target.checked })
                  }
                  className="rounded border-surface-border cursor-pointer"
                />
                <span className="text-sm text-white font-medium">
                  {WEEK_DAY_LABELS[day]}
                </span>
              </label>

              {row.isOpen ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={row.startTime}
                    disabled={readOnly}
                    onChange={(e) =>
                      updateDay(day, { startTime: e.target.value })
                    }
                    className="flex-1 bg-surface border border-surface-border rounded-xl px-3 py-2 text-sm text-white disabled:opacity-50"
                  />
                  <span className="text-gray-500 text-sm">até</span>
                  <input
                    type="time"
                    value={row.endTime}
                    disabled={readOnly}
                    onChange={(e) =>
                      updateDay(day, { endTime: e.target.value })
                    }
                    className="flex-1 bg-surface border border-surface-border rounded-xl px-3 py-2 text-sm text-white disabled:opacity-50"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-500">Fechado</span>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <p className="text-sm text-red-400 mt-4">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-400 mt-4">{success}</p>
      )}

      {!readOnly && (
        <Button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="mt-4 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              A guardar...
            </>
          ) : (
            'Guardar horários'
          )}
        </Button>
      )}
    </Card>
  )
}
