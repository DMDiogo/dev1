import { prisma } from '@/lib/prisma'
import OrdersTable from '@/components/orders/OrdersTable'
import { Prisma } from '@prisma/client'

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim()

  const where: Prisma.OrderWhereInput | undefined = query
    ? {
        OR: [
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { driver: { name: { contains: query, mode: 'insensitive' } } },
          {
            items: {
              some: {
                restaurant: {
                  name: { contains: query, mode: 'insensitive' },
                },
              },
            },
          },
          ...(Number.isFinite(Number(query))
            ? [{ orderCounter: Number(query) }]
            : []),
        ],
      }
    : undefined

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      driver: { select: { name: true } },
      items: { include: { restaurant: { select: { name: true } } } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Pedidos
          </h1>
          <p className="text-gray-400 mt-1">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''}
            {query ? ` para "${query}"` : ' no total'}
          </p>
        </div>
      </div>
      <OrdersTable orders={orders} />
    </div>
  )
}
