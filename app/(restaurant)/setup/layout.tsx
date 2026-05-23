import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/session'

export default async function RestaurantSetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth(['RESTAURANT'])

  if (session.user.restaurantId) {
    redirect('/restaurant/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <header className="border-b border-surface-border px-6 py-4">
        <p className="font-display text-lg font-bold text-white">FoodAdmin</p>
        <p className="text-sm text-gray-500">Configuração do seu restaurante</p>
      </header>
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  )
}
