'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { formatDate } from '@/lib/utils'

type Client = {
  id: string
  name: string
  email: string
  telephone?: string | null
  createdAt: string
  _count?: { orders?: number }
}

export default function UsersSearch({
  users,
  initialQuery = '',
}: {
  users: Client[]
  initialQuery?: string
}) {
  const [query, setQuery] = useState(initialQuery)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.telephone?.toLowerCase().includes(q)
    )
  }, [users, query])

  return (
    <div className="space-y-4">
      <div className="relative max-w-xl">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar clientes por nome, email ou telefone..."
          className="w-full bg-surface border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500/50"
        />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Nome</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Telefone</TableHeader>
            <TableHeader>Pedidos</TableHeader>
            <TableHeader>Registo</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-white">
                {user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.telephone}</TableCell>
              <TableCell>{user._count?.orders ?? 0}</TableCell>
              <TableCell className="text-gray-500 text-xs">
                {formatDate(user.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Nenhum cliente encontrado.
        </p>
      )}
    </div>
  )
}
