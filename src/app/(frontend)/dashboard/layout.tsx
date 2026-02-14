import { notFound, redirect } from 'next/navigation'

import { resolveTenant } from '@/lib/tenant'
import { checkUserTenantAccess } from '@/lib/tenant-check'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { TenantTheme } from '@/components/tenant-theme'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, tenantSlug, tenant, branding } = await resolveTenant()

  // Vérifier l'authentification
  if (!user) {
    const currentPath = '/dashboard'
    redirect(`/login?redirect=${encodeURIComponent(currentPath)}`)
  }

  // Résolution du tenant — obligatoire pour accéder au dashboard
  if (!tenantSlug) {
    redirect('/login')
  }

  if (!tenant) {
    notFound()
  }

  // Vérifier que l'user appartient à ce tenant (isolation cross-tenant)
  if (!checkUserTenantAccess(user, tenant.id)) {
    redirect('/login')
  }

  const churchName = tenant.name

  return (
    <div className="min-h-screen">
      <TenantTheme colors={branding?.colors || {}} />
      <Sidebar churchName={churchName} />

      <div className="md:pl-60 min-h-screen flex flex-col">
        <Header churchName={churchName} userEmail={user.email} />

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
