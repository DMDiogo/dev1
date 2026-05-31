import { Clock } from 'lucide-react'

export default function RestaurantStandbyBanner() {
  return (
    <div className="flex items-start gap-3 text-sm text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-4">
      <Clock size={18} className="shrink-0 mt-0.5 text-amber-400" />
      <div>
        <p className="font-medium text-amber-200">Restaurante em análise</p>
        <p className="text-amber-300/80 mt-1 text-xs leading-relaxed">
          O seu estabelecimento aguarda validação por um administrador. Pode
          configurar produtos e gerir o painel normalmente — a visibilidade
          pública só será activada após aprovação.
        </p>
      </div>
    </div>
  )
}
