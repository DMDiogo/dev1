import RestaurantSetupForm from '@/components/restaurant/RestaurantSetupForm'
import { CheckCircle2 } from 'lucide-react'

export default function RestaurantSetupPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
          <CheckCircle2 size={14} />
          Conta criada com sucesso
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Registar o seu restaurante
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-md">
          Preencha os dados do estabelecimento para gerir produtos e pedidos.
          Só você terá acesso a este restaurante.
        </p>
      </div>
      <RestaurantSetupForm />
    </div>
  )
}
