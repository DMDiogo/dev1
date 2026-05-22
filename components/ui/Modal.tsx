'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            'bg-surface-card border border-surface-border rounded-2xl p-6 shadow-xl',
            'focus:outline-none',
            className
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="font-display text-lg font-semibold text-white">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-gray-400 mt-1">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-muted">
              <X size={18} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
