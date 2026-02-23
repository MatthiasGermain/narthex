import { notFound, redirect } from 'next/navigation'

import { resolveTenant } from '@/lib/tenant'
import { checkUserTenantAccess } from '@/lib/tenant-check'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { TenantTheme } from '@/components/tenant-theme'
import { PageTransition } from '@/components/layout/page-transition'
import { NavigationProgress } from '@/components/layout/navigation-progress'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, tenant, branding } = await resolveTenant()

  // Résolution du tenant — obligatoire pour accéder au dashboard
  if (!tenant) {
    notFound()
  }

  // Vérifier l'authentification
  if (!user) {
    const currentPath = '/dashboard'
    redirect(`/login?redirect=${encodeURIComponent(currentPath)}`)
  }

  // Vérifier que l'user appartient à ce tenant (isolation cross-tenant)
  if (!checkUserTenantAccess(user, tenant.id)) {
    redirect('/login')
  }

  const churchName = tenant.name

  return (
    <div className="min-h-screen">
      <NavigationProgress />
      <TenantTheme colors={branding?.colors || {}} />
      <Sidebar churchName={churchName} />

      <div className="md:pl-60 min-h-screen flex flex-col">
        <Header churchName={churchName} userEmail={user.email} />

        <main className="flex-1 p-4 sm:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
