'use client'

import { Bell } from 'lucide-react'
import HeaderSearch from '@/components/layout/HeaderSearch'

export default function Header() {
  return (
    <header className="h-16 border-b border-surface-border bg-surface-card flex items-center justify-between px-6 shrink-0 gap-4">
      <HeaderSearch />

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-surface-muted/50 transition-colors"
          aria-label="Notificações"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-surface-border">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500 text-sm font-bold">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  )
}
