'use client'

import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState } from 'react'

export default function HeaderSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/orders?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Pesquisar pedidos, clientes..."
        className="w-full bg-surface border border-surface-border rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500/50"
      />
    </form>
  )
}
