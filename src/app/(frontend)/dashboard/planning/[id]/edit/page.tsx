import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Megaphone } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { DEFAULT_SERVICE_ROLES } from '@/lib/service-roles'
import { PlanForm } from '@/components/features/planning/plan-form'
import { Button } from '@/components/ui/button'

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const planId = Number(id)
  if (Number.isNaN(planId)) notFound()

  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) notFound()

  // Seuls les admins peuvent modifier les plannings
  if (user.role !== 'super-admin' && user.role !== 'admin-church') {
    notFound()
  }

  const [plan, { docs: memberDocs }, { docs: groupDocs }, { docs: gatheringDocs }, { docs: roomDocs }] =
    await Promise.all([
    payload
      .findByID({
        collection: 'service-plans',
        id: planId,
        depth: 2,
        overrideAccess: false,
        user,
      })
      .catch(() => null),
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
    payload.find({
      collection: 'gatherings',
      where: { church: { equals: tenant.id } },
      sort: '-startDate',
      limit: 100,
      depth: 0,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'rooms',
      where: { church: { equals: tenant.id }, isActive: { equals: true } },
      sort: 'name',
      limit: 100,
      depth: 0,
      overrideAccess: false,
      user,
    }),
  ])

  if (!plan) notFound()

  // Vérifier que le plan appartient au tenant courant
  const planChurchId = typeof plan.church === 'object' ? plan.church?.id : plan.church
  if (String(planChurchId) !== String(tenant.id)) notFound()

  const members = memberDocs.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
  }))

  const gatherings = gatheringDocs.map((g) => ({ id: g.id, title: g.title }))
  const rooms = roomDocs.map((r) => ({ id: r.id, name: r.name }))

  type LeaderRef = { firstName?: string; lastName?: string }
  const groups = groupDocs.map((g) => {
    const leader = g.leader && typeof g.leader === 'object' ? (g.leader as LeaderRef) : null
    return {
      id: g.id,
      name: g.name,
      leaderName: leader ? `${leader.firstName ?? ''} ${leader.lastName ?? ''}`.trim() || null : null,
    }
  })

  // Rôles configurés par l'église
  const serviceRoles =
    tenant.settings?.serviceRoles && tenant.settings.serviceRoles.length > 0
      ? tenant.settings.serviceRoles.map((r) => r.label)
      : DEFAULT_SERVICE_ROLES.map((r) => r.label)

  // Extraire la date au format YYYY-MM-DD
  const dateValue = plan.date ? new Date(plan.date).toISOString().split('T')[0] : ''

  // Transformer les assignments pour le formulaire
  type MemberDoc = { id: number; firstName: string; lastName: string }
  type GroupRef = { id: number } | number
  const assignments = plan.assignments
    ? (
        plan.assignments as Array<{
          role: string
          members: MemberDoc[] | number[] | null
          group?: GroupRef | null
        }>
      ).map((a) => ({
        role: a.role,
        memberIds: Array.isArray(a.members)
          ? a.members.map((m) => (typeof m === 'object' ? m.id : m))
          : [],
        groupId: a.group ? (typeof a.group === 'object' ? a.group.id : a.group) : null,
      }))
    : []

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {plan.title?.trim() ? `Modifier « ${plan.title.trim()} »` : 'Modifier le culte'}
          </h1>
          <Link href={`/dashboard/planning/${plan.id}/annonces`}>
            <Button variant="outline" size="sm">
              <Megaphone className="mr-2 h-4 w-4" />
              Annonces
            </Button>
          </Link>
        </div>
      </div>

      <PlanForm
        mode="edit"
        churchId={tenant.id}
        members={members}
        groups={groups}
        gatherings={gatherings}
        rooms={rooms}
        serviceRoles={serviceRoles}
        defaultValues={{
          id: plan.id,
          title: plan.title ?? '',
          time: plan.time ?? '',
          endTime: plan.endTime ?? '',
          room:
            typeof plan.room === 'object'
              ? (plan.room?.id ?? null)
              : ((plan.room as number | null | undefined) ?? null),
          gathering:
            typeof plan.gathering === 'object'
              ? (plan.gathering?.id ?? null)
              : ((plan.gathering as number | null | undefined) ?? null),
          date: dateValue,
          assignments,
          notes: plan.notes ?? '',
        }}
      />
    </div>
  )
}
