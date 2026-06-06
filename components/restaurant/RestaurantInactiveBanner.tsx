import { XCircle } from 'lucide-react'

export default function RestaurantInactiveBanner() {
  return (
    <div className="flex items-start gap-3 text-sm text-red-300/90 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-4">
      <XCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
      <div>
        <p className="font-medium text-red-200">Restaurante inactivo</p>
        <p className="text-red-300/80 mt-1 text-xs leading-relaxed">
          O seu restaurante está desactivado e não é visível ao público. 
          Contacte o administrador para reactivar o seu estabelecimento.
        </p>
      </div>
    </div>
  )
}