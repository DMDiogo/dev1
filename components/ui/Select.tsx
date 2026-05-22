import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef } from 'react'

const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'w-full bg-surface border border-surface-border rounded-xl px-3 py-2 text-sm text-white',
      'focus:outline-none focus:border-brand-500/50',
      'disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'

export default Select
