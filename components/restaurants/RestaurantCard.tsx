import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'

type RestaurantCardProps = {
  id: string
  name: string
  address: string
  telephone: string | null
  logo: string | null
  productCount: number
  orderItemCount: number
}

export default function RestaurantCard({
  id,
  name,
  address,
  telephone,
  logo,
  productCount,
  orderItemCount,
}: RestaurantCardProps) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-5 hover:border-brand-500/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-semibold text-white">{name}</h3>
          <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
            <MapPin size={12} />
            <span>{address}</span>
          </div>
        </div>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={name}
            className="w-10 h-10 rounded-lg object-cover"
          />
        )}
      </div>

      {telephone && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Phone size={11} />
          <span>{telephone}</span>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-surface-border flex items-center justify-between text-xs">
        <span className="text-gray-400">{productCount} produtos</span>
        <span className="text-gray-400">{orderItemCount} itens vendidos</span>
        <Link
          href={`/restaurants/${id}`}
          className="text-brand-500 hover:text-brand-400 font-medium"
        >
          Ver detalhes →
        </Link>
      </div>
    </div>
  )
}
