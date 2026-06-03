import Link from 'next/link'
import { requireRestaurant } from '@/lib/session'
import { getRestaurantById } from '@/lib/api/api_server_backend'
import EditRestaurantForm from '@/components/restaurants/EditRestaurantForm'
import RestaurantStatusBadge from '@/components/restaurants/RestaurantStatusBadge'
import { Clock } from 'lucide-react'

export default async function RestaurantProfilePage() {
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
          <h1 className="font-display text-3xl font-bold text-white">Perfil</h1>
          <p className="text-gray-400 mt-1">
            Logo, dados do estabelecimento e identidade pública
          </p>
        </div>
        {restaurant.status && (
          <RestaurantStatusBadge status={restaurant.status} />
        )}
      </div>

      <EditRestaurantForm
        variant="restaurant"
        restaurant={{
          id: restaurant.id,
          name: restaurant.name,
          logo: restaurant.logo,
          address: restaurant.address,
          telephone: restaurant.telephone,
          email: restaurant.email,
          website: restaurant.website,
          taxId: restaurant.taxId,
          status: restaurant.status,
        }}
      />

      <Link
        href="/restaurant/settings"
        className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300"
      >
        <Clock size={16} />
        Gerir horário de funcionamento
      </Link>
    </div>
  )
}
