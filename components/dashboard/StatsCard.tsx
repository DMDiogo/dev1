import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const colorMap = {
  orange: 'text-brand-500 bg-brand-500/10',
  blue: 'text-blue-400 bg-blue-500/10',
  green: 'text-green-400 bg-green-500/10',
  purple: 'text-purple-400 bg-purple-500/10',
}

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: keyof typeof colorMap
  change?: string
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  change,
}: StatsCardProps) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-5 hover:border-brand-500/20 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="font-display text-2xl font-bold text-white mt-1">
            {value}
          </p>
          {change && (
            <p className="text-xs text-gray-500 mt-2">{change}</p>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-xl',
            colorMap[color]
          )}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}
