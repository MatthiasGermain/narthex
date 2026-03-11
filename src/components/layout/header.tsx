import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'
import { DashboardStaggeredMenu } from '@/components/layout/dashboard-staggered-menu'

interface HeaderProps {
  churchName: string
  userEmail: string
  userName?: string | null
  userRole: string
}

function getInitials(name?: string | null, email?: string): string {
  if (name) {
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return parts[0]?.slice(0, 2).toUpperCase() ?? '?'
  }
  return email?.slice(0, 2).toUpperCase() ?? '?'
}

export function Header({ churchName, userEmail, userName, userRole }: HeaderProps) {
  const initials = getInitials(userName, userEmail)

  return (
    <header className="border-b border-raisin/8 bg-white px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Gauche — Église + lien site */}
      <div className="flex items-center gap-3 min-w-0">
        <h2 className="font-heading font-bold text-sm truncate">{churchName}</h2>
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Voir le site
        </Link>
      </div>

      {/* Droite — Avatar + Déconnexion */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/account"
          className="hidden md:flex items-center gap-2.5 rounded-full hover:bg-muted/60 px-2 py-1 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-raisin/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-raisin/70">{initials}</span>
          </div>
          <div className="min-w-0 text-right">
            {userName && (
              <p className="text-sm font-medium truncate leading-tight">{userName}</p>
            )}
            <p className="text-xs text-muted-foreground truncate leading-tight">{userEmail}</p>
          </div>
        </Link>

        <div className="md:hidden">
          <DashboardStaggeredMenu churchName={churchName} userRole={userRole} />
        </div>
        <div className="hidden md:block">
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
