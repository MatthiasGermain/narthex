import { headers as getHeaders } from 'next/headers.js'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getTenantSlug, getTenantBySlug } from '@/lib/tenant'
import { checkUserTenantAccess } from '@/lib/tenant-check'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Vérifier l'authentification
  const { user } = await payload.auth({ headers })
  if (!user) {
    const currentPath = headers.get('x-next-url') || '/dashboard'
    redirect(`/login?redirect=${encodeURIComponent(currentPath)}`)
  }

  // Résolution du tenant — obligatoire pour accéder au dashboard
  const tenantSlug = getTenantSlug(headers)
  if (!tenantSlug) {
    redirect('/login')
  }

  const tenant = await getTenantBySlug(payload, tenantSlug)
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
