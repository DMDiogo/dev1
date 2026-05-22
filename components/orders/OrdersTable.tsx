import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'

type OrderRow = {
  id: string
  orderCounter: number
  total: number
  status: string
  createdAt: Date
  user: { name: string } | null
  driver: { name: string } | null
  items: { restaurant: { name: string } }[]
}

export default function OrdersTable({ orders }: { orders: OrderRow[] }) {
  if (orders.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-8 text-center">
        Nenhum pedido encontrado.
      </p>
    )
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>#</TableHeader>
          <TableHeader>Cliente</TableHeader>
          <TableHeader>Restaurante</TableHeader>
          <TableHeader>Motorista</TableHeader>
          <TableHeader>Total</TableHeader>
          <TableHeader>Estado</TableHeader>
          <TableHeader>Data</TableHeader>
          <TableHeader />
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order) => {
          const restaurantName =
            order.items[0]?.restaurant?.name ?? '—'
          return (
            <TableRow key={order.id}>
              <TableCell className="font-medium text-white">
                {order.orderCounter}
              </TableCell>
              <TableCell>{order.user?.name ?? '—'}</TableCell>
              <TableCell className="text-gray-400">{restaurantName}</TableCell>
              <TableCell className="text-gray-400">
                {order.driver?.name ?? '—'}
              </TableCell>
              <TableCell className="font-medium text-white">
                {formatCurrency(order.total)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-gray-500 text-xs">
                {formatDate(order.createdAt)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-brand-500 hover:text-brand-400 text-xs font-medium"
                >
                  Ver →
                </Link>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
