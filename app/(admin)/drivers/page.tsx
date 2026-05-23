import { prisma } from '@/lib/prisma'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import StatsCard from '@/components/dashboard/StatsCard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { formatDate } from '@/lib/utils'
import { Truck, Package, CheckCircle2 } from 'lucide-react'
import { OrderStatus } from '@prisma/client'

const ACTIVE_STATUSES: OrderStatus[] = [
  'ACCEPTED_DRIVER',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
]

export default async function DriversPage() {
  const [drivers, activeDeliveries, completedDeliveries] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'DRIVER' },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { driverOrders: true } },
        driverOrders: {
          where: { status: { in: ACTIVE_STATUSES } },
          select: { id: true },
          take: 1,
        },
      },
    }),
    prisma.order.count({
      where: { driverId: { not: null }, status: { in: ACTIVE_STATUSES } },
    }),
    prisma.order.count({
      where: { status: 'DELIVERED', driverId: { not: null } },
    }),
  ])

  const busyCount = drivers.filter((d) => d.driverOrders.length > 0).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          Motoristas
        </h1>
        <p className="text-gray-400 mt-1">
          Gestão de entregadores da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          label="Motoristas"
          value={drivers.length}
          icon={Truck}
          color="orange"
          change="registados"
        />
        <StatsCard
          label="Em entrega"
          value={activeDeliveries}
          icon={Package}
          color="blue"
          change={`${busyCount} motoristas ocupados`}
        />
        <StatsCard
          label="Entregas concluídas"
          value={completedDeliveries}
          icon={CheckCircle2}
          color="green"
          change="total histórico"
        />
      </div>

      {drivers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Nenhum motorista"
          description="Os motoristas são criados na app de entregas. Quando existirem na base de dados, aparecem aqui com estatísticas de entregas."
        />
      ) : (
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
            {drivers.map((driver) => {
              const isBusy = driver.driverOrders.length > 0
              return (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium text-white">
                    {driver.name}
                  </TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.telephone}</TableCell>
                  <TableCell>{driver._count.driverOrders}</TableCell>
                  <TableCell>
                    <Badge variant={isBusy ? 'warning' : 'success'}>
                      {isBusy ? 'Em entrega' : 'Disponível'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {formatDate(driver.createdAt)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
