'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Package,
  Users,
  UserCog,
  Truck,
  ChevronRight,
} from 'lucide-react'
import Logo from '@/components/auth/Logo'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Pedidos', icon: ShoppingBag },
  { href: '/restaurants', label: 'Restaurantes', icon: UtensilsCrossed },
  { href: '/products', label: 'Produtos', icon: Package },
  { href: '/users', label: 'Clientes', icon: Users },
  { href: '/staff', label: 'Utilizadores', icon: UserCog },
  { href: '/drivers', label: 'Motoristas', icon: Truck },
]

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-full bg-surface-card border-r border-surface-border flex flex-col">
      <div className="p-5 sm:p-6 border-b border-surface-border">
        <Logo size={36} href="/dashboard" />
        <p className="text-xs text-gray-500 mt-2">Painel Administrador</p>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  active
                    ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-surface-muted/50'
                }
              `}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="shrink-0" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-surface-border">
        <p className="text-xs text-gray-600 text-center">v1.0.0 · Angola</p>
      </div>
    </aside>
  )
}
