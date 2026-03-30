import { Home, ClipboardList, Calendar, DoorOpen, Users, UserCircle, Church, BookOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  exact: boolean
  adminOnly?: boolean
}

export const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Accueil', icon: Home, exact: true },
  { href: '/dashboard/planning', label: 'Cultes', icon: ClipboardList, exact: false },
  { href: '/dashboard/events', label: 'Événements', icon: Calendar, exact: false },
  { href: '/dashboard/sermons', label: 'Prédications', icon: BookOpen, exact: false },
  { href: '/dashboard/rooms', label: 'Salles', icon: DoorOpen, exact: false },
  { href: '/dashboard/members', label: 'Membres', icon: Users, exact: false },
  { href: '/dashboard/account', label: 'Mon profil', icon: UserCircle, exact: true },
  { href: '/dashboard/profile', label: 'Profil église', icon: Church, exact: true, adminOnly: true },
]

export function getVisibleNavItems(userRole: string): NavItem[] {
  return navItems.filter((item) => !item.adminOnly || userRole !== 'volunteer')
}
