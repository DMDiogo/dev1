export function ordersForRestaurant(restaurantId: string) {
  return {
    items: { some: { restaurantId } },
  };
}

export function orderItemsForRestaurant(
  restaurantId: string
) {
  return { restaurantId };
}
