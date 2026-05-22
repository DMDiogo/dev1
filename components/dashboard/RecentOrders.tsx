import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'

type RecentOrder = {
  id: string
  orderCounter: number
  total: number
  status: string
  createdAt: Date
  user: { name: string }
}

export default function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
        <h3 className="font-display font-semibold text-white mb-4">
          Pedidos Recentes
        </h3>
        <p className="text-sm text-gray-500">Nenhum pedido registado.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-white">
          Pedidos Recentes
        </h3>
        <Link
          href="/orders"
          className="text-xs text-brand-500 hover:text-brand-400 font-medium"
        >
          Ver todos →
        </Link>
      </div>
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-muted/30 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  #{order.orderCounter} · {order.user.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <span className="text-sm font-medium text-white">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
