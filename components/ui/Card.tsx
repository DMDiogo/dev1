import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

export default function Card({
  className,
  title,
  description,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface-card border border-surface-border rounded-2xl p-5',
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="font-display font-semibold text-white">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
