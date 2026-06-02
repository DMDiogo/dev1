export function unwrapList<T>(
  data: T[] | { value?: T[]; Count?: number } | null | undefined
): T[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.value)) return data.value
  return []
}

export function orderBelongsToRestaurant(
  order: { items?: { restaurantId?: string }[] },
  restaurantId: string
): boolean {
  return (
    order.items?.some((item) => item.restaurantId === restaurantId) ?? false
  )
}

export function filterOrdersForRestaurant<T extends { items?: { restaurantId?: string }[] }>(
  orders: T[],
  restaurantId: string
): T[] {
  return orders.filter((order) => orderBelongsToRestaurant(order, restaurantId))
}

export function filterOrderItemsForRestaurant<
  T extends { items?: { restaurantId?: string }[] },
>(order: T, restaurantId: string): T {
  return {
    ...order,
    items:
      order.items?.filter((item) => item.restaurantId === restaurantId) ?? [],
  }
}

export function buildRestaurantDashboardStats(
  orders: {
    userId?: string
    createdAt: string
    items?: { restaurantId?: string; subtotal?: number; price?: number; quantity?: number }[]
  }[],
  products: unknown[],
  restaurantId: string
) {
  const restaurantOrders = filterOrdersForRestaurant(orders, restaurantId)
  const clientIds = new Set(
    restaurantOrders.map((order) => order.userId).filter(Boolean)
  )

  const revenue = restaurantOrders.reduce((sum, order) => {
    const itemsTotal =
      order.items
        ?.filter((item) => item.restaurantId === restaurantId)
        .reduce(
          (itemSum, item) =>
            itemSum +
            (item.subtotal ?? (item.price ?? 0) * (item.quantity ?? 1)),
          0
        ) ?? 0
    return sum + itemsTotal
  }, 0)

  const recentOrders = [...restaurantOrders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  return {
    orderCount: restaurantOrders.length,
    clientCount: clientIds.size,
    productCount: products.length,
    revenue: { _sum: { price: revenue } },
    recentOrders,
  }
}

export function buildClientsFromOrders(
  orders: {
    userId?: string
    user?: { name?: string; email?: string; telephone?: string }
    createdAt: string
    items?: { restaurantId?: string }[]
  }[],
  restaurantId: string
) {
  const restaurantOrders = filterOrdersForRestaurant(orders, restaurantId)
  const byUser = new Map<
    string,
    {
      id: string
      name: string
      email: string
      telephone: string
      createdAt: string
      orders: unknown[]
    }
  >()

  for (const order of restaurantOrders) {
    if (!order.userId || !order.user) continue

    const existing = byUser.get(order.userId)
    if (existing) {
      existing.orders.push(order)
      continue
    }

    byUser.set(order.userId, {
      id: order.userId,
      name: order.user.name ?? '',
      email: order.user.email ?? '',
      telephone: order.user.telephone ?? '',
      createdAt: order.createdAt,
      orders: [order],
    })
  }

  return Array.from(byUser.values())
}

type OrderWithDriver = {
  driverId?: string
  driver?: {
    id?: string
    name?: string
    email?: string
    telephone?: string
    status?: string
    createdAt?: string
  }
  status?: string
  items?: { restaurantId?: string }[]
}

export type DriverFromOrders = {
  id: string
  name: string
  email: string
  telephone: string
  status?: string
  createdAt?: string
  role: 'DRIVER'
  driverOrders: OrderWithDriver[]
  _count?: { driverOrders: number }
}

function upsertDriverFromOrder(
  byDriver: Map<string, DriverFromOrders>,
  order: OrderWithDriver
) {
  if (!order.driverId) return

  const profile = order.driver
  const existing = byDriver.get(order.driverId)

  if (existing) {
    existing.driverOrders.push(order)
    return
  }

  byDriver.set(order.driverId, {
    id: order.driverId,
    name: profile?.name ?? 'Motorista',
    email: profile?.email ?? '',
    telephone: profile?.telephone ?? '',
    status: profile?.status,
    createdAt: profile?.createdAt,
    role: 'DRIVER',
    driverOrders: [order],
    _count: { driverOrders: 0 },
  })
}

/** Motoristas únicos a partir de todos os pedidos (fallback quando /api/users falha). */
export function buildDriversFromAllOrders(
  orders: OrderWithDriver[]
): DriverFromOrders[] {
  const byDriver = new Map<string, DriverFromOrders>()

  for (const order of orders) {
    upsertDriverFromOrder(byDriver, order)
  }

  return Array.from(byDriver.values()).map((driver) => ({
    ...driver,
    _count: { driverOrders: driver.driverOrders.length },
  }))
}

export function buildDriversFromOrders(
  orders: OrderWithDriver[],
  restaurantId: string
) {
  const restaurantOrders = filterOrdersForRestaurant(orders, restaurantId)
  const byDriver = new Map<string, DriverFromOrders>()

  for (const order of restaurantOrders) {
    if (!order.driverId || !order.driver) continue
    upsertDriverFromOrder(byDriver, order)
  }

  return Array.from(byDriver.values()).map((driver) => ({
    ...driver,
    _count: { driverOrders: driver.driverOrders.length },
  }))
}
