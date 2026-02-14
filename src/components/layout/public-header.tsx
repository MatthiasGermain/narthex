'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Home, Calendar, LogIn, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/', label: 'Accueil', icon: Home, exact: true },
  { href: '/events', label: 'Événements', icon: Calendar, exact: false },
]

interface PublicHeaderProps {
  churchName: string
  logoUrl?: string | null
  isLoggedIn?: boolean
}

export function PublicHeader({ churchName, logoUrl, isLoggedIn }: PublicHeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const memberItem = isLoggedIn
    ? { href: '/dashboard', label: 'Mon espace', icon: LayoutDashboard }
    : { href: '/login', label: 'Espace membre', icon: LogIn }

  return (
    <header className="border-b bg-card px-4 sm:px-6 py-3">
      <div className="mx-auto max-w-5xl flex items-center justify-between">
        {/* Logo + Church name */}
        <Link href="/" className="flex items-center gap-3 min-w-0">
          {logoUrl ? (
            <img src={logoUrl} alt={churchName} className="h-8 w-8 rounded object-contain" />
          ) : (
            <img src="/brand/pictogramme_noir_sans_fond.svg" alt="Narthex" className="h-7 w-7" />
          )}
          <span className="font-heading font-bold text-sm truncate">{churchName}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Link
            href={memberItem.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <memberItem.icon className="h-4 w-4" />
            {memberItem.label}
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0">
            <SheetHeader className="px-4 py-4">
              <SheetTitle className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt={churchName} className="h-7 w-7 rounded object-contain" />
                ) : (
                  <img src="/brand/pictogramme_noir_sans_fond.svg" alt="Narthex" className="h-7 w-7" />
                )}
                <span className="font-heading text-sm font-bold truncate">{churchName}</span>
              </SheetTitle>
            </SheetHeader>
            <Separator />
            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
              <Separator className="my-2" />
              <Link
                href={memberItem.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <memberItem.icon className="h-4 w-4" />
                {memberItem.label}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
