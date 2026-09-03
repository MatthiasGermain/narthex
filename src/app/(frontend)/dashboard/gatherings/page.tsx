import Link from 'next/link'
import { CalendarRange, Plus, MapPin } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { isAdminRole } from '@/access'
import { formatDateRange, isPast } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GatheringActions } from '@/components/features/gatherings/gathering-actions'

export default async function GatheringsPage() {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const isAdmin = isAdminRole(user)

  const { docs: gatherings } = await payload.find({
    collection: 'gatherings',
    where: { church: { equals: tenant.id } },
    sort: '-startDate',
    limit: 100,
    depth: 0,
    overrideAccess: false,
    user,
  })

  const ids = gatherings.map((g) => g.id)

  // Compter le programme de chaque rassemblement en deux requêtes, pas 2×N.
  let linkedEvents: { gathering?: unknown }[] = []
  let linkedPlans: { gathering?: unknown }[] = []

  if (ids.length > 0) {
    const [eventsResult, plansResult] = await Promise.all([
      payload.find({
        collection: 'events',
        where: { church: { equals: tenant.id }, gathering: { in: ids } },
        limit: 500,
        depth: 0,
        overrideAccess: false,
        user,
      }),
      payload.find({
        collection: 'service-plans',
        where: { church: { equals: tenant.id }, gathering: { in: ids } },
        limit: 500,
        depth: 0,
        overrideAccess: false,
        user,
      }),
    ])
    linkedEvents = eventsResult.docs
    linkedPlans = plansResult.docs
  }

  /** `depth: 0` renvoie un id brut, mais on reste tolérant à un objet peuplé. */
  const relId = (value: unknown): number | null => {
    if (typeof value === 'number') return value
    if (value && typeof value === 'object') return (value as { id?: number }).id ?? null
    return null
  }

  const countsByGathering = new Map<number, { events: number; plans: number }>()
  for (const id of ids) countsByGathering.set(id, { events: 0, plans: 0 })
  for (const e of linkedEvents) {
    const entry = countsByGathering.get(relId(e.gathering) ?? -1)
    if (entry) entry.events += 1
  }
  for (const p of linkedPlans) {
    const entry = countsByGathering.get(relId(p.gathering) ?? -1)
    if (entry) entry.plans += 1
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Rassemblements</h1>
        {isAdmin && (
          <Link href="/dashboard/gatherings/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Créer</span>
            </Button>
          </Link>
        )}
      </div>

      {gatherings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <CalendarRange className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucun rassemblement</p>
          <p className="text-sm mt-1 max-w-md">
            Un rassemblement réunit plusieurs événements et cultes sur une même période :
            week-end d’église, convention, semaine de prière.
          </p>
          {isAdmin && (
            <Link href="/dashboard/gatherings/new" className="mt-4">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Créer un rassemblement
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gatherings.map((gathering) => {
            const counts = countsByGathering.get(gathering.id) ?? { events: 0, plans: 0 }
            const total = counts.events + counts.plans
            const over = isPast(gathering.endDate)

            return (
              <Link key={gathering.id} href={`/dashboard/gatherings/${gathering.id}`}>
                <div
                  className={`h-full rounded-lg border border-raisin/8 bg-raisin/5 p-4 transition-shadow hover:shadow-md ${
                    over ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-bold truncate">{gathering.title}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatDateRange(gathering.startDate, gathering.endDate)}
                      </p>
                    </div>
                    {isAdmin && (
                      <GatheringActions
                        gatheringId={gathering.id}
                        gatheringTitle={gathering.title}
                        canDelete={isAdmin}
                      />
                    )}
                  </div>

                  {gathering.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {gathering.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {total === 0
                        ? 'Programme vide'
                        : [
                            counts.events > 0 &&
                              `${counts.events} événement${counts.events > 1 ? 's' : ''}`,
                            counts.plans > 0 && `${counts.plans} culte${counts.plans > 1 ? 's' : ''}`,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                    </Badge>
                    {gathering.location && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="mr-1 h-3 w-3" />
                        {gathering.location}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
