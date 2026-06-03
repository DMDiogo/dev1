import Link from 'next/link'
import { requireRestaurant } from '@/lib/session'
import WorkingHoursEditor from '@/components/restaurants/WorkingHoursEditor'
import { mergeWithDefaults } from '@/lib/working-hours'
import { getRestaurantById } from '@/lib/api/api_server_backend'
import { User } from 'lucide-react'

export default async function RestaurantSettingsPage() {
  const session = await requireRestaurant()
  const restaurantId = session.user.restaurantId!

  const restaurant = await getRestaurantById(restaurantId)

  if (!restaurant) {
    return <p className="text-gray-400">Restaurante não encontrado.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Horário
          </h1>
          <p className="text-gray-400 mt-1">{restaurant.name}</p>
        </div>
        <Link
          href="/restaurant/profile"
          className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300"
        >
          <User size={16} />
          Ir ao perfil (logo e dados)
        </Link>
      </div>

      <WorkingHoursEditor
        restaurantId={restaurant.id}
        initialHours={mergeWithDefaults(restaurant.workingHours)}
      />
    </div>
  )
}
