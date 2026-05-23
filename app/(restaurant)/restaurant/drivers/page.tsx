import { prisma } from '@/lib/prisma'
import { requireRestaurant } from '@/lib/session'
import { ordersForRestaurant } from '@/lib/restaurant-scope'
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
import { Truck, Package, CheckCircle2 } from 'lucide-react'
import { OrderStatus } from '@prisma/client'

const ACTIVE_STATUSES: OrderStatus[] = [
  'ACCEPTED_DRIVER',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
]

export default async function RestaurantDriversPage() {
  const session = await requireRestaurant()
  const restaurantId = session.user.restaurantId!
  const scope = ordersForRestaurant(restaurantId)

  const ordersWithDrivers = await prisma.order.findMany({
    where: { ...scope, driverId: { not: null } },
    select: { driverId: true },
    distinct: ['driverId'],
  })

  const driverIds = ordersWithDrivers
    .map((o) => o.driverId)
    .filter((id): id is string => id !== null)

  const [drivers, activeForRestaurant, completedForRestaurant] =
    await Promise.all([
      driverIds.length === 0
        ? []
        : prisma.user.findMany({
            where: { id: { in: driverIds }, role: 'DRIVER' },
            include: {
              driverOrders: {
                where: scope,
                select: { id: true, status: true },
              },
            },
          }),
      prisma.order.count({
        where: {
          ...scope,
          driverId: { not: null },
          status: { in: ACTIVE_STATUSES },
        },
      }),
      prisma.order.count({
        where: { ...scope, status: 'DELIVERED', driverId: { not: null } },
      }),
    ])

  const busyDrivers = drivers.filter((d) =>
    d.driverOrders.some((o) => ACTIVE_STATUSES.includes(o.status))
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Motoristas</h1>
        <p className="text-gray-400 mt-1">
          Entregadores que já fizeram entregas do seu restaurante
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          label="Motoristas"
          value={drivers.length}
          icon={Truck}
          color="orange"
          change="com entregas suas"
        />
        <StatsCard
          label="Entregas activas"
          value={activeForRestaurant}
          icon={Package}
          color="blue"
          change={`${busyDrivers} ocupados agora`}
        />
        <StatsCard
          label="Concluídas"
          value={completedForRestaurant}
          icon={CheckCircle2}
          color="green"
          change="no seu restaurante"
        />
      </div>

      {drivers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Sem motoristas ainda"
          description="Quando um motorista aceitar e entregar pedidos do seu restaurante, aparecerá aqui com o histórico de entregas."
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
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((driver) => {
              const isBusy = driver.driverOrders.some((o) =>
                ACTIVE_STATUSES.includes(o.status)
              )
              return (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium text-white">
                    {driver.name}
                  </TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.telephone}</TableCell>
                  <TableCell>{driver.driverOrders.length}</TableCell>
                  <TableCell>
                    <Badge variant={isBusy ? 'warning' : 'success'}>
                      {isBusy ? 'Em entrega' : 'Disponível'}
                    </Badge>
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
