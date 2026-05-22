import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white',
  secondary: 'bg-surface-muted hover:bg-surface-border text-white border border-surface-border',
  ghost: 'hover:bg-surface-muted/50 text-gray-300',
  danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export default Button
