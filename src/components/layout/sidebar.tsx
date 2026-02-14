'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Church } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: Home, exact: true },
  { href: '/dashboard/events', label: 'Événements', icon: Calendar, exact: false },
  { href: '/dashboard/profile', label: 'Profil église', icon: Church, exact: true },
]

export function Sidebar({ churchName }: { churchName: string }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-sidebar-background text-sidebar-foreground">
      <div className="flex h-14 items-center px-4 gap-3">
        <img
          src="/brand/pictogramme_noir_sans_fond.svg"
          alt="Narthex"
          className="h-7 w-7 invert"
        />
        <span className="font-heading text-sm font-bold truncate">{churchName}</span>
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
