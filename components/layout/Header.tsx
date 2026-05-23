'use client'

import { Menu } from 'lucide-react'
import HeaderSearch from '@/components/layout/HeaderSearch'
import UserMenu from '@/components/layout/UserMenu'

type HeaderProps = {
  showSearch?: boolean
  onMenuClick?: () => void
}

export default function Header({
  showSearch = true,
  onMenuClick,
}: HeaderProps) {
  return (
    <header className="h-14 sm:h-16 border-b border-surface-border bg-surface-card flex items-center justify-between px-4 sm:px-6 shrink-0 gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-1 rounded-xl text-gray-400 hover:text-white hover:bg-surface-muted/50"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        {showSearch ? (
          <HeaderSearch />
        ) : (
          <div className="flex-1 lg:hidden" />
        )}
      </div>
      <UserMenu />
    </header>
  )
}
