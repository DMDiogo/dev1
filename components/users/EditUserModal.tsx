'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

type Client = {
  id: string
  name: string
  email: string
  telephone?: string | null
  address?: string | null
}

export default function EditUserModal({
  user,
  onClose,
  onSave,
}: {
  user: Client
  onClose: () => void
  onSave: (id: string, data: Partial<Client>) => Promise<void>
}) {
  const [form, setForm] = useState({
    name: user.name ?? '',
    email: user.email ?? '',
    telephone: user.telephone ?? '',
    address: user.address ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      await onSave(user.id, form)
      onClose()
    } catch (e: any) {
      setError(e.message || 'Erro ao guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface border border-surface-border rounded-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-display text-xl font-bold">Editar cliente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Nome', key: 'name' },
            { label: 'Email', key: 'email' },
            { label: 'Telefone', key: 'telephone' },
            { label: 'Morada', key: 'address' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-surface-muted border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500/50"
              />
            </div>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-surface-border text-gray-400 hover:text-white text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}