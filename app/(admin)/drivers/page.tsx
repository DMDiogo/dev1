import Link from 'next/link'
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
import { getDrivers } from '@/lib/api/api_server_backend'
import {
  driverHasActiveDelivery,
  driverIsInTransit,
  driverStatusLabel,
  driverStatusVariant,
} from '@/lib/driver-status'
import type { OrderStatus } from '@/types/next-auth'

const ACTIVE_STATUSES: OrderStatus[] = [
  'ACCEPTED_DRIVER',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
]

export default async function DriversPage() {
  let drivers: Awaited<ReturnType<typeof getDrivers>> = []
  let loadError: string | null = null

  try {
    drivers = await getDrivers()
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : 'Não foi possível carregar os motoristas.'
    console.error('[DriversPage]', error)
  }

  const busyCount = drivers.filter((d) =>
    driverHasActiveDelivery(d.driverOrders)
  ).length

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

      {loadError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadError}
        </div>
      )}

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
          value={drivers.filter(d => d.driverOrders?.some((o: any) => ACTIVE_STATUSES.includes(o.status as OrderStatus))).length}
          icon={Package}
          color="blue"
          change={`${busyCount} motoristas ocupados`}
        />
        <StatsCard
          label="Entregas concluídas"
          value={drivers.reduce((acc, d) => acc + (d.driverOrders?.filter((o: any) => o.status === 'DELIVERED').length ?? 0), 0)}
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
              <TableHeader className="text-right">Ficha</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers.map((driver) => {
              const inTransit = driverIsInTransit(driver.driverOrders)
              const accountStatus = driver.status ?? 'ACTIVE'
              return (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium text-white">
                    <Link
                      href={`/drivers/${driver.id}`}
                      className="hover:text-brand-400 transition-colors"
                    >
                      {driver.name}
                    </Link>
                  </TableCell>
                  <TableCell>{driver.email}</TableCell>
                  <TableCell>{driver.telephone}</TableCell>
                  <TableCell>
                    {driver._count?.driverOrders ??
                      driver.driverOrders?.length ??
                      0}
                  </TableCell>
                  <TableCell>
                    {inTransit ? (
                      <Badge variant="warning">Em entrega</Badge>
                    ) : (
                      <Badge variant={driverStatusVariant(accountStatus)}>
                        {driverStatusLabel(accountStatus)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {formatDate(driver.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/drivers/${driver.id}`}
                      className="text-sm text-brand-400 hover:text-brand-300"
                    >
                      Ver ficha
                    </Link>
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
