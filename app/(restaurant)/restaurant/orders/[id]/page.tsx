import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireRestaurant } from '@/lib/session'
import { getRestaurantOrderById } from '@/lib/api/api_server_backend'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'
import OrderStatusSelect from '@/components/orders/OrderStatusSelect'
import Card from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

export default async function RestaurantOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireRestaurant()
  const restaurantId = session.user.restaurantId!
  const { id } = await params

  let order
  try {
    order = await getRestaurantOrderById(restaurantId, id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/restaurant/orders"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-surface-muted/50 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Pedido #{order.orderCounter}
          </h1>
          <p className="text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <Card title="Gestão do pedido">
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Cliente">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Nome</dt>
              <dd className="text-white">{order.user?.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Telefone</dt>
              <dd className="text-white">{order.user?.telephone}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Motorista">
          {order.driver ? (
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Nome</dt>
                <dd className="text-white">{order.driver.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Telefone</dt>
              <dd className="text-white">{order.driver.telephone}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">Sem motorista atribuído</p>
          )}
        </Card>

        <Card title="Total (itens do restaurante)">
          <p className="text-2xl font-display font-bold text-brand-500">
            {formatCurrency(
              order.items?.reduce((s: number, i: any) => s + i.price * i.quantity, 0) ?? 0
            )}
          </p>
        </Card>
      </div>

      <Card title="Itens do seu restaurante">
        <ul className="divide-y divide-surface-border">
          {order.items?.map((item: any) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-white font-medium">{item.product?.name}</p>
                <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
              </div>
              <span className="text-white font-medium">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
