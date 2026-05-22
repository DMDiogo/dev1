import { prisma } from '@/lib/prisma'
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

export default async function DriversPage() {
  const drivers = await prisma.user.findMany({
    where: { role: 'DRIVER' },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { driverOrders: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          Motoristas
        </h1>
        <p className="text-gray-400 mt-1">
          {drivers.length} motoristas registados
        </p>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Nome</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Telefone</TableHeader>
            <TableHeader>Entregas</TableHeader>
            <TableHeader>Estado</TableHeader>
            <TableHeader>Registo</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell className="font-medium text-white">
                {driver.name}
              </TableCell>
              <TableCell>{driver.email}</TableCell>
              <TableCell>{driver.telephone}</TableCell>
              <TableCell>{driver._count.driverOrders}</TableCell>
              <TableCell>
                <Badge variant="success">Disponível</Badge>
              </TableCell>
              <TableCell className="text-gray-500 text-xs">
                {formatDate(driver.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
