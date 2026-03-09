import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'
import { DashboardStaggeredMenu } from '@/components/layout/dashboard-staggered-menu'

interface HeaderProps {
  churchName: string
  userEmail: string
  userRole: string
}

export function Header({ churchName, userEmail, userRole }: HeaderProps) {
  return (
    <header className="border-b bg-card px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h2 className="font-heading font-bold text-sm truncate">{churchName}</h2>
          <Link href="/dashboard/account" className="text-xs text-muted-foreground truncate hover:text-foreground transition-colors">{userEmail}</Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
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
