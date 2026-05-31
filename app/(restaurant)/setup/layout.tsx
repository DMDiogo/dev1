import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/session'
import { resolveRestaurantForUser } from '@/lib/restaurant-link'

export default async function RestaurantSetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth(['RESTAURANT'])

  if (session.user.restaurantId) {
    redirect('/restaurant/dashboard')
  }

  const linked = await resolveRestaurantForUser({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  })

  if (linked) {
    redirect('/restaurant/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <header className="border-b border-surface-border px-6 py-4 bg-surface/50 backdrop-blur-sm">
        <p className="font-display text-lg font-bold text-white">FoodAdmin</p>
        <p className="text-sm text-gray-500">Configuração do seu restaurante</p>
      </header>
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative w-full max-w-lg">{children}</div>
      </main>
    </div>
  )
}
