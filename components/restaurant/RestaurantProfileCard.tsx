import Link from 'next/link'
import EditRestaurantForm from '@/components/restaurants/EditRestaurantForm'
import { Clock } from 'lucide-react'

export default function RestaurantProfileCard({
  restaurant,
}: {
  restaurant: {
    id: string
    name: string
    address: string
    telephone?: string | null
    email?: string | null
    website?: string | null
    taxId?: string | null
    logo?: string | null
    status?: string | null
  }
}) {
  return (
    <div className="space-y-6">
      <EditRestaurantForm variant="restaurant" restaurant={restaurant} />
      <Link
        href="/restaurant/settings"
        className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300"
      >
        <Clock size={16} />
        Horário de funcionamento
      </Link>
    </div>
  )
}
