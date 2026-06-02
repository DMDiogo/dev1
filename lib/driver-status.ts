import type { OrderStatus } from '@/types/next-auth'

export const DRIVER_ACCOUNT_STATUSES = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'STAND_BY', label: 'Em análise' },
  { value: 'INACTIVE', label: 'Inactivo' },
] as const

/** Pedido em trânsito — motorista “em entrega” (não altera estado da conta). */
export function driverIsInTransit(orders: { status?: string }[] | undefined) {
  return orders?.some((order) => order.status === 'IN_TRANSIT') ?? false
}

/** Outros estados de pedido ainda atribuídos ao motorista (lista/estatísticas). */
export const DRIVER_BUSY_ORDER_STATUSES: OrderStatus[] = [
  'ACCEPTED_DRIVER',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
]

export function driverHasActiveDelivery(
  orders: { status?: string }[] | undefined
) {
  return (
    orders?.some((order) =>
      DRIVER_BUSY_ORDER_STATUSES.includes(order.status as OrderStatus)
    ) ?? false
  )
}

export function driverStatusLabel(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'Activo',
    STAND_BY: 'Em análise',
    INACTIVE: 'Inactivo',
  }
  return map[status] ?? status
}

export function driverStatusVariant(
  status: string
): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'ACTIVE') return 'success'
  if (status === 'STAND_BY') return 'warning'
  if (status === 'INACTIVE') return 'danger'
  return 'default'
}
