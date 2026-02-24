import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { DEFAULT_SERVICE_ROLES } from '@/lib/service-roles'
import { PlanForm } from '@/components/features/planning/plan-form'

export default async function NewPlanPage() {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  // Seuls les admins peuvent créer des plannings
  if (user.role !== 'super-admin' && user.role !== 'admin-church') {
    notFound()
  }

  // Charger les membres actifs pour le sélecteur
  const { docs: memberDocs } = await payload.find({
    collection: 'members',
    where: { church: { equals: tenant.id }, isActive: { equals: true } },
    sort: 'lastName',
    limit: 200,
    depth: 0,
    overrideAccess: false,
    user,
  })

  const members = memberDocs.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
  }))

  // Rôles configurés par l'église, avec fallback sur les rôles par défaut
  const serviceRoles =
    tenant.settings?.serviceRoles && tenant.settings.serviceRoles.length > 0
      ? tenant.settings.serviceRoles.map((r) => r.label)
      : DEFAULT_SERVICE_ROLES.map((r) => r.label)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/planning"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux cultes
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Nouveau culte</h1>
      </div>

      <PlanForm
        mode="create"
        churchId={tenant.id}
        members={members}
        serviceRoles={serviceRoles}
      />
    </div>
  )
}
