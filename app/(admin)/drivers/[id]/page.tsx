import Link from 'next/link'
import { notFound } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import DriverStatusForm from '@/components/drivers/DriverStatusForm'
import { getDriverById } from '@/lib/api/api_server_backend'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  driverIsInTransit,
  driverStatusLabel,
  driverStatusVariant,
} from '@/lib/driver-status'
import { ArrowLeft } from 'lucide-react'

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const driver = await getDriverById(id)

  if (!driver) {
    notFound()
  }

  const orders = driver.driverOrders ?? []
  const onDelivery = driverIsInTransit(orders)
  const accountStatus = driver.status ?? 'ACTIVE'

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/drivers"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft size={16} />
          Voltar aos motoristas
        </Link>
        <h1 className="font-display text-3xl font-bold text-white">
          {driver.name}
        </h1>
        <p className="text-gray-400 mt-1">Ficha do motorista</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-surface border border-surface-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Dados</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-white text-right">{driver.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Telefone</dt>
              <dd className="text-white text-right">
                {driver.telephone ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Registo</dt>
              <dd className="text-white text-right">
                {driver.createdAt ? formatDate(driver.createdAt) : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4 items-center">
              <dt className="text-gray-500">Estado actual</dt>
              <dd>
                {onDelivery ? (
                  <Badge variant="warning">Em entrega</Badge>
                ) : (
                  <Badge variant={driverStatusVariant(accountStatus)}>
                    {driverStatusLabel(accountStatus)}
                  </Badge>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Total entregas</dt>
              <dd className="text-white text-right">
                {driver._count?.driverOrders ?? orders.length}
              </dd>
            </div>
          </dl>
        </section>

        <section className="bg-surface border border-surface-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">
            Alterar estado da conta
          </h2>
          <DriverStatusForm
            driverId={driver.id}
            currentStatus={accountStatus}
            orders={orders}
          />
        </section>
      </div>

      {orders.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            Entregas recentes
          </h2>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Pedido</TableHeader>
                <TableHeader>Estado</TableHeader>
                <TableHeader>Total</TableHeader>
                <TableHeader>Data</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.slice(0, 10).map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-white">
                    #{order.orderCounter ?? order.id?.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(order.totalPrice ?? order.total ?? 0)}
                  </TableCell>
                  <TableCell className="text-gray-500 text-xs">
                    {formatDate(order.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  )
}
