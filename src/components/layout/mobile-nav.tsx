'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Home, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: Home, exact: true },
  { href: '/dashboard/events', label: 'Événements', icon: Calendar, exact: false },
]

export function MobileNav({ churchName }: { churchName: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar-background text-sidebar-foreground p-0">
        <SheetHeader className="px-4 py-4">
          <SheetTitle className="flex items-center gap-3 text-sidebar-foreground">
            <img
              src="/brand/pictogramme_noir_sans_fond.svg"
              alt="Narthex"
              className="h-7 w-7 invert"
            />
            <span className="font-heading text-sm font-bold truncate">{churchName}</span>
          </SheetTitle>
        </SheetHeader>

        <Separator className="bg-sidebar-border" />

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
      </SheetContent>
    </Sheet>
  )
}
