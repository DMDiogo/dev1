import { prisma } from '@/lib/prisma'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { formatDate } from '@/lib/utils'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          Clientes
        </h1>
        <p className="text-gray-400 mt-1">{users.length} clientes registados</p>
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
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-white">
                {user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.telephone}</TableCell>
              <TableCell>{user._count.orders}</TableCell>
              <TableCell className="text-gray-500 text-xs">
                {formatDate(user.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
