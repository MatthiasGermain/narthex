import { LogoutButton } from '@/components/logout-button'
import { MobileNav } from '@/components/layout/mobile-nav'

interface HeaderProps {
  churchName: string
  userEmail: string
}

export function Header({ churchName, userEmail }: HeaderProps) {
  return (
    <header className="border-b bg-card px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <MobileNav churchName={churchName} />
        <div className="min-w-0">
          <h2 className="font-heading font-bold text-sm truncate">{churchName}</h2>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
        </div>
      </div>
      <LogoutButton />
    </header>
  )
}
