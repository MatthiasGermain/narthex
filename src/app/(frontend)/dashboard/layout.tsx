import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

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

  // Récupérer le nom du membre lié à l'utilisateur
  const payload = await getPayload({ config })
  const { docs: memberDocs } = await payload.find({
    collection: 'members',
    where: { user: { equals: user.id }, church: { equals: tenant.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const member = memberDocs[0]
  const userName = member ? `${member.firstName} ${member.lastName}`.trim() : null

  return (
    <div className="min-h-screen">
      <NavigationProgress />
      <TenantTheme colors={branding?.colors || {}} />
      <Sidebar churchName={churchName} userRole={user.role} />

      <div className="md:pl-60 min-h-screen flex flex-col">
        <Header churchName={churchName} userEmail={user.email} userName={userName} userRole={user.role} />

        <main className="flex-1 p-4 sm:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
