'use client'

import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState } from 'react'

type SearchMode = 'orders' | 'clients'

export default function HeaderSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('orders')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    if (mode === 'clients') {
      router.push(`/users?q=${encodeURIComponent(q)}`)
      return
    }

    router.push(`/orders?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 max-w-lg gap-2 min-w-0">
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as SearchMode)}
        className="bg-surface border border-surface-border rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500/50 shrink-0"
        aria-label="Tipo de pesquisa"
      >
        <option value="orders">Pedidos</option>
        <option value="clients">Clientes</option>
      </select>
      <div className="relative flex-1 min-w-0">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === 'orders'
              ? 'Pesquisar pedidos...'
              : 'Pesquisar clientes...'
          }
          className="w-full bg-surface border border-surface-border rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500/50"
        />
      </div>
    </form>
  )
}
