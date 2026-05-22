import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge'
import OrderStatusSelect from '@/components/orders/OrderStatusSelect'
import Card from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      driver: true,
      items: {
        include: {
          product: true,
          restaurant: true,
        },
      },
    },
  })

  if (!order) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/orders"
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
        <Card title="Cliente" className="lg:col-span-1">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Nome</dt>
              <dd className="text-white">{order.user.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Telefone</dt>
              <dd className="text-white">{order.user.telephone}</dd>
            </div>
            {order.user.address && (
              <div>
                <dt className="text-gray-500">Morada</dt>
                <dd className="text-white">{order.user.address}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Motorista" className="lg:col-span-1">
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

        <Card title="Resumo" className="lg:col-span-1">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Subtotal</dt>
              <dd className="text-white">{formatCurrency(order.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">IVA</dt>
              <dd className="text-white">{formatCurrency(order.totalIVA)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Entrega</dt>
              <dd className="text-white">
                {formatCurrency(order.deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between pt-2 border-t border-surface-border font-medium">
              <dt className="text-white">Total</dt>
              <dd className="text-brand-500">{formatCurrency(order.total)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card title="Itens do pedido">
        <ul className="divide-y divide-surface-border">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-white font-medium">{item.product.name}</p>
                <p className="text-xs text-gray-500">
                  {item.restaurant.name} · Qtd: {item.quantity}
                </p>
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
