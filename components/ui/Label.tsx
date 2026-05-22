import { cn } from '@/lib/utils'
import { LabelHTMLAttributes } from 'react'

export default function Label({
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('block text-xs font-medium text-gray-400 mb-1.5', className)}
      {...props}
    >
      {children}
    </label>
  )
}
