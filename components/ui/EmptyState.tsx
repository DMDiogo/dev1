import { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-surface-card border border-surface-border rounded-2xl">
      <div className="w-14 h-14 rounded-2xl bg-surface-muted/50 flex items-center justify-center mb-4">
        <Icon className="text-gray-500" size={28} />
      </div>
      <h3 className="font-display font-semibold text-white text-lg">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">{description}</p>
    </div>
  )
}
