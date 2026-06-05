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

type FormErrors = {
  name?: string
  email?: string
  telephone?: string
  address?: string
}

function validateForm(form: { name: string; email: string; telephone: string; address: string }): FormErrors {
  const errors: FormErrors = {}

  // Nome
  if (!form.name.trim()) {
    errors.name = 'Nome é obrigatório'
  } else if (form.name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres'
  } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(form.name.trim())) {
    errors.name = 'Nome só pode conter letras'
  }

  // Email
  if (!form.email.trim()) {
    errors.email = 'Email é obrigatório'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Email inválido'
  }

  // Telefone
  if (form.telephone.trim()) {
    const digits = form.telephone.replace(/\D/g, '')
    if (digits.length < 9 || digits.length > 15) {
      errors.telephone = 'Telefone deve ter entre 9 e 15 dígitos'
    }
  }

  // Morada
  if (form.address.trim()) {
    if (/https?:\/\//i.test(form.address)) {
      errors.address = 'Morada não pode ser uma URL'
    } else if (form.address.trim().length < 5) {
      errors.address = 'Morada demasiado curta'
    } else if (form.address.trim().length > 200) {
      errors.address = 'Morada demasiado longa'
    } else if (!/^[a-zA-ZÀ-ÿ0-9\s,.\-\/nº°]+$/.test(form.address.trim())) {
      errors.address = 'Morada contém caracteres inválidos'
    }
  }

  return errors
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
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    // Limpa o erro do campo ao escrever
    setFieldErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function handleSubmit() {
    const errors = validateForm(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

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

  const fields = [
    { label: 'Nome', key: 'name', placeholder: 'Ex: João Silva' },
    { label: 'Email', key: 'email', placeholder: 'Ex: joao@email.com' },
    { label: 'Telefone', key: 'telephone', placeholder: 'Ex: 923456789' },
    { label: 'Morada', key: 'address', placeholder: 'Ex: Rua da Samba, nº 12, Luanda' },
  ]

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
          {fields.map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-surface-muted border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none transition-colors ${
                  fieldErrors[key as keyof FormErrors]
                    ? 'border-red-500/70 focus:border-red-500'
                    : 'border-surface-border focus:border-brand-500/50'
                }`}
              />
              {fieldErrors[key as keyof FormErrors] && (
                <p className="text-red-400 text-xs mt-1">
                  {fieldErrors[key as keyof FormErrors]}
                </p>
              )}
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