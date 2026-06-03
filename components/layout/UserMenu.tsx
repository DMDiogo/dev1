'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import * as Dropdown from '@radix-ui/react-dropdown-menu'
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Store,
  User,
} from 'lucide-react'
import RestaurantLogo from '@/components/ui/RestaurantLogo'

export default function UserMenu() {
  const { data: session } = useSession()
  const user = session?.user
  const isRestaurant = user?.role === 'RESTAURANT'
  const restaurantLogo = user?.restaurantLogo
  const displayName = isRestaurant
    ? user?.restaurantName ?? user?.name
    : user?.name
  const initial = displayName?.charAt(0)?.toUpperCase() ?? '?'
  const roleLabel =
    user?.role === 'ADMIN'
      ? 'Administrador'
      : user?.role === 'RESTAURANT'
        ? 'Gestor de restaurante'
        : 'Utilizador'

  const homeHref =
    user?.role === 'RESTAURANT'
      ? '/restaurant/dashboard'
      : '/dashboard'

  const profileHref =
    user?.role === 'RESTAURANT' ? '/restaurant/profile' : '/dashboard'

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 sm:border-l border-surface-border rounded-xl hover:bg-surface-muted/30 p-1.5 sm:p-0 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
        >
          {isRestaurant && restaurantLogo ? (
            <RestaurantLogo
              logoPath={restaurantLogo}
              name={displayName ?? 'R'}
              className="w-8 h-8 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-500 text-sm font-bold shrink-0">
              {initial}
            </div>
          )}
          <div className="hidden sm:block text-left max-w-[140px]">
            <p className="text-sm font-medium text-white truncate">
              {displayName ?? 'Utilizador'}
            </p>
            <p className="text-xs text-gray-500 truncate">{roleLabel}</p>
          </div>
          <ChevronDown
            size={16}
            className="hidden sm:block text-gray-500 shrink-0"
          />
        </button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          className="min-w-[220px] bg-surface-card border border-surface-border rounded-xl p-1 shadow-xl z-50"
          sideOffset={8}
          align="end"
        >
          <div className="px-3 py-2.5 border-b border-surface-border mb-1">
            <p className="text-sm font-medium text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {user?.email}
            </p>
            {isRestaurant && user?.restaurantName && (
              <p className="text-xs text-brand-500/90 truncate mt-1 flex items-center gap-1">
                <Store size={12} />
                {user.restaurantName}
              </p>
            )}
          </div>

          <Dropdown.Item asChild>
            <Link
              href={homeHref}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 rounded-lg outline-none cursor-pointer hover:bg-surface-muted hover:text-white data-[highlighted]:bg-surface-muted data-[highlighted]:text-white"
            >
              <LayoutDashboard size={16} />
              Painel principal
            </Link>
          </Dropdown.Item>

          {user?.role === 'RESTAURANT' && user.restaurantId && (
            <>
              <Dropdown.Item asChild>
                <Link
                  href="/restaurant/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 rounded-lg outline-none cursor-pointer hover:bg-surface-muted hover:text-white data-[highlighted]:bg-surface-muted data-[highlighted]:text-white"
                >
                  <User size={16} />
                  Perfil
                </Link>
              </Dropdown.Item>
              <Dropdown.Item asChild>
                <Link
                  href="/restaurant/products"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 rounded-lg outline-none cursor-pointer hover:bg-surface-muted hover:text-white data-[highlighted]:bg-surface-muted data-[highlighted]:text-white"
                >
                  <Store size={16} />
                  Produtos
                </Link>
              </Dropdown.Item>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <Dropdown.Item asChild>
              <Link
                href={profileHref}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 rounded-lg outline-none cursor-pointer hover:bg-surface-muted hover:text-white data-[highlighted]:bg-surface-muted data-[highlighted]:text-white"
              >
                <User size={16} />
                Conta
              </Link>
            </Dropdown.Item>
          )}

          <Dropdown.Separator className="h-px bg-surface-border my-1" />

          <Dropdown.Item
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 rounded-lg outline-none cursor-pointer data-[highlighted]:bg-red-500/10 data-[highlighted]:text-red-300"
            onSelect={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut size={16} />
            Terminar sessão
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  )
}
