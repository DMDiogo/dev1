const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: 'Pendente',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  ACCEPTED: {
    label: 'Aceite',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  ACCEPTED_DRIVER: {
    label: 'Driver Aceite',
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  PREPARING: {
    label: 'A Preparar',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  READY_FOR_PICKUP: {
    label: 'Pronto',
    color: 'bg-brand-500/10 text-brand-500 border-brand-500/20',
  },
  PICKED_UP: {
    label: 'Recolhido',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  IN_TRANSIT: {
    label: 'Em Trânsito',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  DELIVERED: {
    label: 'Entregue',
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
}

export default function OrderStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  }
  return (
    <span
      className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${config.color}
    `}
    >
      {config.label}
    </span>
  )
}
