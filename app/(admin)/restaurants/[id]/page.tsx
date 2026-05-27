import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRestaurantById } from '@/lib/api/api_server_backend'
import Card from '@/components/ui/Card'
import EditRestaurantForm from '@/components/restaurants/EditRestaurantForm'
import WorkingHoursEditor from '@/components/restaurants/WorkingHoursEditor'
import { mergeWithDefaults } from '@/lib/working-hours'
import { ArrowLeft, MapPin, Phone, Mail } from 'lucide-react'

import RestaurantLogo from '@/components/ui/RestaurantLogo'

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const restaurant = await getRestaurantById(id)

  if (!restaurant) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/restaurants"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-surface-muted/50 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-4">
          <RestaurantLogo
              logoPath={restaurant.logo}
              name={restaurant.name}
              className="w-14 h-14"
            />
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              {restaurant.name}
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-1">
              <MapPin size={14} />
              {restaurant.address}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Contacto">
          <dl className="space-y-3 text-sm">
            {restaurant.telephone && (
              <div className="flex items-center gap-2 text-gray-300">
                <Phone size={14} className="text-gray-500" />
                {restaurant.telephone}
              </div>
            )}
            {restaurant.email && (
              <div className="flex items-center gap-2 text-gray-300">
                <Mail size={14} className="text-gray-500" />
                {restaurant.email}
              </div>
            )}
            {restaurant.website && (
              <div>
                <dt className="text-gray-500 text-xs">Website</dt>
                <dd className="text-brand-500">{restaurant.website}</dd>
              </div>
            )}
            {restaurant.latitude != null && restaurant.longitude != null && (
              <div>
                <dt className="text-gray-500 text-xs">Coordenadas GPS</dt>
                <dd className="text-gray-300 font-mono text-xs">
                  {restaurant.latitude.toFixed(5)}, {restaurant.longitude.toFixed(5)}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Estatísticas">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Produtos</dt>
              <dd className="text-2xl font-display font-bold text-white">
                {restaurant._count?.products ?? 0}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Itens vendidos</dt>
              <dd className="text-2xl font-display font-bold text-white">
                {restaurant._count?.orderItems ?? 0}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <EditRestaurantForm
        restaurant={{
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          telephone: restaurant.telephone,
          email: restaurant.email,
          website: restaurant.website,
          taxId: restaurant.taxId,
        }}
      />

      <WorkingHoursEditor
        restaurantId={restaurant.id}
        initialHours={mergeWithDefaults(restaurant.workingHours)}
      />

      {restaurant.products && restaurant.products.length > 0 && (
        <Card title="Produtos">
          <ul className="divide-y divide-surface-border">
            {restaurant.products.map((p: any) => (
              <li
                key={p.id}
                className="flex justify-between py-3 first:pt-0 last:pb-0"
              >
                <span className="text-white">{p.name}</span>
                <span className="text-brand-500 font-medium">
                  {p.price.toLocaleString('pt-AO')} Kz
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
