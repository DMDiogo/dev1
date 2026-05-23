'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/layout/Sidebar'
import RestaurantSidebar from '@/components/layout/RestaurantSidebar'
import Header from '@/components/layout/Header'

type AppShellProps = {
  variant: 'admin' | 'restaurant'
  restaurantName?: string
  showSearch?: boolean
  children: React.ReactNode
}

export default function AppShell({
  variant,
  restaurantName,
  showSearch = variant === 'admin',
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {variant === 'admin' ? (
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        ) : (
          <RestaurantSidebar
            restaurantName={restaurantName ?? 'Restaurante'}
            onNavigate={() => setMobileOpen(false)}
          />
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          showSearch={showSearch}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-[#0a0a0a]">
          {children}
        </main>
      </div>
    </div>
  )
}
