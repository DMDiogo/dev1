import RestaurantCard from '@/components/restaurants/RestaurantCard'
import NewRestaurantButton from '@/components/restaurants/NewRestaurantButton'
import { getRestaurants } from '@/lib/api/api_server_backend'

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Restaurantes
          </h1>
          <p className="text-gray-400 mt-1">
            {restaurants.length} restaurantes registados
          </p>
        </div>
        <NewRestaurantButton />
      </div>

      {restaurants.length === 0 ? (
        <div className="bg-surface-card border border-surface-border rounded-2xl p-12 text-center">
          <p className="text-gray-400">Ainda não há restaurantes registados.</p>
          <p className="text-sm text-gray-500 mt-2">
            Clica em &quot;+ Novo Restaurante&quot; para adicionar o primeiro.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {restaurants.map((r) => (
          <RestaurantCard
            key={r.id}
            id={r.id}
            name={r.name}
            address={r.address}
            telephone={r.telephone}
            logo={r.logo}
            status={r.status}
            productCount={r._count?.products ?? 0}
            orderItemCount={r._count?.orderItems ?? 0}
          />
        ))}
      </div>
      )}
    </div>
  )
}
