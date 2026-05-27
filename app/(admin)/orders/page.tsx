import OrdersTable from '@/components/orders/OrdersTable'
import { getOrders } from '@/lib/api/api_server_backend'

type OrderWhereInput = {
  OR?: Array<{
    user?: { name?: { contains?: string; mode?: string } }
    driver?: { name?: { contains?: string; mode?: string } }
    items?: { some?: { restaurant?: { name?: { contains?: string; mode?: string } } } }
    orderCounter?: number
  }>
} | undefined

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim()

  const where: OrderWhereInput = query
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
            ? [{ orderCounter: Number(query) } as any]
            : []),
        ],
      }
    : undefined

  const orders = await getOrders(query)

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
