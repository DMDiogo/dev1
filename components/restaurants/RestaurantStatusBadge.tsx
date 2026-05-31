const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Ativo',
    className: 'text-green-400 bg-green-500/10 border-green-500/20',
  },
  STAND_BY: {
    label: 'Em análise',
    className: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  INACTIVE: {
    label: 'Inativo',
    className: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  },
}

export default function RestaurantStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  }

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  )
}
