import { Prisma } from '@prisma/client'

export function ordersForRestaurant(restaurantId: string): Prisma.OrderWhereInput {
  return {
    items: { some: { restaurantId } },
  }
}

export function orderItemsForRestaurant(
  restaurantId: string
): Prisma.OrderItemWhereInput {
  return { restaurantId }
}
