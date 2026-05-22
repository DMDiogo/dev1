import { cn } from '@/lib/utils'
import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

export function Table({
  className,
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-surface-border">
      <table
        className={cn('w-full text-sm text-left', className)}
        {...props}
      />
    </div>
  )
}

export function TableHead({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'bg-surface-card text-xs uppercase text-gray-400 border-b border-surface-border',
        className
      )}
      {...props}
    />
  )
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-y divide-surface-border" {...props} />
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'bg-surface-card hover:bg-surface-muted/30 transition-colors',
        className
      )}
      {...props}
    />
  )
}

export function TableHeader({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn('px-4 py-3 font-medium', className)} {...props} />
  )
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3 text-gray-300', className)} {...props} />
  )
}
