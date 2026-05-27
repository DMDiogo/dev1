import { requireRestaurant } from '@/lib/session'
import { getRestaurantDrivers } from '@/lib/api/api_server_backend'
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
import type { OrderStatus } from '@/types/next-auth'

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

  const drivers = await getRestaurantDrivers(restaurantId)

  // Calculate stats from the drivers data
  const completedForRestaurant = drivers.reduce((acc, driver) => 
    acc + (driver.driverOrders?.filter((o: any) => o.status === 'DELIVERED').length ?? 0), 0
  )
  
  const activeForRestaurant = drivers.reduce((acc, driver) => 
    acc + (driver.driverOrders?.filter((o: any) => ACTIVE_STATUSES.includes(o.status as OrderStatus)).length ?? 0), 0
  )
  
  const busyDrivers = drivers.filter((driver) => 
    driver.driverOrders?.some((o: any) => ACTIVE_STATUSES.includes(o.status as OrderStatus)) ?? false
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
              const isBusy = driver.driverOrders?.some((o: any) => 
                ACTIVE_STATUSES.includes(o.status as OrderStatus)
              ) ?? false
              return (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium text-white">
                    {driver.name}
                  </TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.telephone}</TableCell>
                  <TableCell>{driver.driverOrders?.length ?? 0}</TableCell>
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