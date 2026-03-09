'use client'

import { useRouter } from 'next/navigation'
import { StaggeredMenu, type StaggeredMenuItem } from '@/components/layout/staggered-menu'
import { getVisibleNavItems } from '@/components/layout/nav-items'

interface DashboardStaggeredMenuProps {
  churchName: string
  userRole: string
}

export function DashboardStaggeredMenu({ churchName, userRole }: DashboardStaggeredMenuProps) {
  const router = useRouter()
  const items: StaggeredMenuItem[] = getVisibleNavItems(userRole).map((item) => ({
    label: item.label,
    href: item.href,
    exact: item.exact,
  }))

  const handleLogout = async () => {
    await fetch('/api/users/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <StaggeredMenu
      items={items}
      churchName={churchName}
      side="right"
      layerColors={['#FCCA46', '#8B80F9']}
      panelClassName="bg-sidebar-background text-sidebar-foreground"
      logoClassName="invert"
      itemColorClass="text-sidebar-foreground/70 hover:text-sunglow"
      itemActiveColorClass="text-sunglow"
      closeBtnColorClass="text-sidebar-foreground/50 hover:text-sidebar-foreground"
      onLogout={handleLogout}
    />
  )
}
