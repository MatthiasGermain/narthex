import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { DEFAULT_SERVICE_ROLES } from '@/lib/service-roles'
import { PlanForm } from '@/components/features/planning/plan-form'

interface Props {
  searchParams: Promise<{ date?: string }>
}

export default async function NewPlanPage({ searchParams }: Props) {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  // Seuls les admins peuvent créer des plannings
  if (user.role !== 'super-admin' && user.role !== 'admin-church') {
    notFound()
  }

  // Charger les membres actifs et les groupes pour les sélecteurs
  const [{ docs: memberDocs }, { docs: groupDocs }] = await Promise.all([
    payload.find({
      collection: 'members',
      where: { church: { equals: tenant.id } },
      sort: 'lastName',
      limit: 200,
      depth: 0,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'groups',
      where: { church: { equals: tenant.id } },
      sort: 'name',
      limit: 200,
      depth: 1,
      overrideAccess: false,
      user,
    }),
  ])

  const members = memberDocs.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
  }))

  type LeaderRef = { firstName?: string; lastName?: string }
  const groups = groupDocs.map((g) => {
    const leader = g.leader && typeof g.leader === 'object' ? (g.leader as LeaderRef) : null
    return {
      id: g.id,
      name: g.name,
      leaderName: leader ? `${leader.firstName ?? ''} ${leader.lastName ?? ''}`.trim() || null : null,
    }
  })

  // Rôles configurés par l'église, avec fallback sur les rôles par défaut
  const serviceRoles =
    tenant.settings?.serviceRoles && tenant.settings.serviceRoles.length > 0
      ? tenant.settings.serviceRoles.map((r) => r.label)
      : DEFAULT_SERVICE_ROLES.map((r) => r.label)

  // Date pré-remplie depuis le calendrier (format YYYY-MM-DD)
  const { date } = await searchParams
  const defaultDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined

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
        groups={groups}
        serviceRoles={serviceRoles}
        defaultValues={defaultDate ? { date: defaultDate } : undefined}
      />
    </div>
  )
}
