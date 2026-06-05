import Badge from '@/components/ui/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { formatDate } from '@/lib/utils'
import { getStaffUsers } from '@/lib/api/api_server_backend'
import StaffStatusForm from '@/components/staff/StaffStatusForm'

function roleLabel(role: string) {
  if (role === 'ADMIN') return 'Administrador'
  if (role === 'RESTAURANT') return 'Restaurante'
  return role
}

function roleVariant(role: string): 'info' | 'warning' | 'default' {
  if (role === 'ADMIN') return 'info'
  if (role === 'RESTAURANT') return 'warning'
  return 'default'
}

export default async function StaffUsersPage() {
  const users = await getStaffUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          Utilizadores
        </h1>
        <p className="text-gray-400 mt-1">
          {users.length} conta{users.length !== 1 ? 's' : ''} (Admin e
          Restaurante) — altere o estado directamente na tabela
        </p>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Nome</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Telefone</TableHeader>
            <TableHeader>Perfil</TableHeader>
            <TableHeader>Estado</TableHeader>
            <TableHeader>Registo</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-white">
                {user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.telephone ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={roleVariant(user.role)}>
                  {roleLabel(user.role)}
                </Badge>
              </TableCell>
              <TableCell>
                <StaffStatusForm
                  userId={user.id}
                  currentStatus={user.status ?? 'ACTIVE'}
                />
              </TableCell>
              <TableCell className="text-gray-500 text-xs">
                {formatDate(user.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {users.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Nenhum utilizador encontrado.
        </p>
      )}
    </div>
  )
}
