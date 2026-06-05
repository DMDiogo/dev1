'use client'

import { useMemo, useState } from 'react'
import { Search, Pencil } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { formatDate } from '@/lib/utils'
import EditUserModal from './EditUserModal'

type Client = {
  id: string
  name: string
  email: string
  telephone?: string | null
  address?: string | null
  createdAt: string
  _count?: { orders?: number }
}

export default function UsersSearch({
  users,
  initialQuery = '',
  onUpdateUser,
}: {
  users: Client[]
  initialQuery?: string
  onUpdateUser: (id: string, data: Partial<Client>) => Promise<void>
}) {
  const [query, setQuery] = useState(initialQuery)
  const [editingUser, setEditingUser] = useState<Client | null>(null)
  const [localUsers, setLocalUsers] = useState(users)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return localUsers
    return localUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.telephone?.toLowerCase().includes(q)
    )
  }, [localUsers, query])

  async function handleSave(id: string, data: Partial<Client>) {
    await onUpdateUser(id, data)
    setLocalUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...data } : u))
    )
  }

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
            <TableHeader></TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((user) => (
            <TableRow
              key={user.id}
              className="hover:bg-surface-muted/50 transition-colors"
            >
              <TableCell className="font-medium text-white">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.telephone}</TableCell>
              <TableCell>{user._count?.orders ?? 0}</TableCell>
              <TableCell className="text-gray-500 text-xs">
                {formatDate(user.createdAt)}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => setEditingUser(user)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-surface-muted transition-colors"
                >
                  <Pencil size={14} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-8">Nenhum cliente encontrado.</p>
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}