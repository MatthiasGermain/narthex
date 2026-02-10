import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getTenantSlug, getTenantBySlug } from '@/lib/tenant'
import { LogoutButton } from '@/components/logout-button'

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

  // Résolution du tenant
  const tenantSlug = getTenantSlug(headers)
  const tenant = tenantSlug ? await getTenantBySlug(payload, tenantSlug) : null

  // Vérifier que l'user appartient à ce tenant (isolation cross-tenant)
  if (tenant && user.role !== 'super-admin') {
    const userChurchId = typeof user.church === 'object' ? (user.church as { id: number })?.id : user.church
    if (userChurchId !== tenant.id) {
      redirect('/login')
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-semibold truncate">{tenant?.name ?? 'Narthex'}</h2>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
        <LogoutButton />
      </header>
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  )
}
