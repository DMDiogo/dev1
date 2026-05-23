import AppShell from '@/components/layout/AppShell'
import { requireRestaurant } from '@/lib/session'

export default async function RestaurantPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireRestaurant()
  const restaurantName =
    session.user.restaurantName ?? 'O meu restaurante'

  return (
    <AppShell variant="restaurant" restaurantName={restaurantName} showSearch={false}>
      {children}
    </AppShell>
  )
}
