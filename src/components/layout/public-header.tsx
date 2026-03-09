'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogIn } from 'lucide-react'
import { StaggeredMenu, type StaggeredMenuItem } from '@/components/layout/staggered-menu'

const navItems: StaggeredMenuItem[] = [
  { href: '/', label: 'Accueil', exact: true },
  { href: '/events', label: 'Événements' },
  { href: '/about', label: 'À propos' },
]

interface PublicHeaderProps {
  churchName: string
  logoUrl?: string | null
  isLoggedIn?: boolean
}

export function PublicHeader({ churchName, logoUrl, isLoggedIn }: PublicHeaderProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const memberItem = isLoggedIn
    ? { href: '/dashboard', label: 'Mon espace', icon: LayoutDashboard }
    : { href: '/login', label: 'Espace membre', icon: LogIn }

  const allMenuItems: StaggeredMenuItem[] = [
    ...navItems,
    { href: memberItem.href, label: memberItem.label },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-2 mx-4 mt-3 rounded-full bg-cream/80 backdrop-blur-xl border border-raisin/8 shadow-sm'
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-5 flex items-center justify-between">
        {/* Logo + Church name */}
        <Link href="/" className="flex items-center gap-2.5 min-w-0 shrink-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={churchName}
              width={scrolled ? 24 : 28}
              height={scrolled ? 24 : 28}
              className={`rounded object-contain transition-all duration-300 ${scrolled ? 'h-6 w-6' : 'h-7 w-7'}`}
            />
          ) : (
            <Image
              src="/brand/pictogramme_noir_sans_fond.svg"
              alt="Narthex"
              width={scrolled ? 22 : 28}
              height={scrolled ? 22 : 28}
              className={`transition-all duration-300 ${scrolled ? 'h-5.5 w-5.5' : 'h-7 w-7'}`}
            />
          )}
          {!scrolled && (
            <span className="font-heading font-bold text-sm text-raisin truncate max-w-50">
              {churchName}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm font-medium uppercase tracking-wide transition-colors duration-200 group ${
                  isActive ? 'text-raisin' : 'text-raisin/60 hover:text-raisin'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-sunglow rounded-full" />
                )}
              </Link>
            )
          })}

          <Link
            href={memberItem.href}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-sunglow px-4 py-1.5 text-sm font-medium text-sunglow hover:bg-sunglow hover:text-raisin transition-colors duration-200"
          >
            <memberItem.icon className="h-3.5 w-3.5" />
            {memberItem.label}
          </Link>
        </nav>

        {/* Mobile — StaggeredMenu toggle button */}
        <div className="md:hidden">
          <StaggeredMenu items={allMenuItems} churchName={churchName} logoUrl={logoUrl} />
        </div>
      </div>
    </header>
  )
}
