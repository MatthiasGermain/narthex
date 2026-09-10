import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Pencil, Sun, Calendar } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { isAdminRole } from '@/access'
import { formatDateRange, formatDateShort, formatTime, servicePlanTitle } from '@/lib/format'
import { formatFrenchDate } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GatheringActions } from '@/components/features/gatherings/gathering-actions'
import { AttachPicker, type AttachCandidate } from '@/components/features/gatherings/attach-picker'
import { DetachButton } from '@/components/features/gatherings/detach-button'

interface ProgramItem {
  kind: 'event' | 'plan'
  id: number
  dateISO: string
  title: string
  time: string | null
  href: string
}

/** Découpe la partie YYYY-MM-DD d'une date Payload. */
function dayOf(value: string): string {
  return new Date(value).toISOString().split('T')[0]
}

/** Titre du rassemblement auquel un élément est déjà rattaché (depth 1). */
function attachedGathering(value: unknown): { id: number; title: string } | null {
  return value && typeof value === 'object' && 'title' in value
    ? (value as { id: number; title: string })
    : null
}

export default async function GatheringDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const gatheringId = Number(id)
  if (Number.isNaN(gatheringId)) notFound()

  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) notFound()

  const isAdmin = isAdminRole(user)

  const gathering = await payload
    .findByID({
      collection: 'gatherings',
      id: gatheringId,
      depth: 0,
      overrideAccess: false,
      user,
    })
    .catch(() => null)

  if (!gathering) notFound()

  const gatheringChurchId =
    typeof gathering.church === 'object' ? gathering.church?.id : gathering.church
  if (String(gatheringChurchId) !== String(tenant.id)) notFound()

  // Tous les événements et cultes de l'église : ceux d'ici composent le
  // programme, les autres alimentent le sélecteur de rattachement.
  const [{ docs: allEvents }, { docs: allPlans }] = await Promise.all([
    payload.find({
      collection: 'events',
      where: { church: { equals: tenant.id } },
      sort: 'date',
      limit: 300,
      depth: 1,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'service-plans',
      where: { church: { equals: tenant.id } },
      sort: 'date',
      limit: 300,
      depth: 1,
      overrideAccess: false,
      user,
    }),
  ])

  const belongsHere = (value: unknown) => attachedGathering(value)?.id === gathering.id

  const events = allEvents.filter((e) => belongsHere(e.gathering))
  const plans = allPlans.filter((p) => belongsHere(p.gathering))

  const items: ProgramItem[] = [
    ...events.map((e) => ({
      kind: 'event' as const,
      id: e.id,
      dateISO: dayOf(e.date),
      title: e.title,
      time: e.time ?? null,
      href: `/dashboard/events/${e.id}/edit`,
    })),
    ...plans.map((p) => ({
      kind: 'plan' as const,
      id: p.id,
      dateISO: dayOf(p.date),
      title: servicePlanTitle(p.title),
      time: p.time ?? null,
      href: `/dashboard/planning/${p.id}/edit`,
    })),
  ].sort((a, b) => {
    const byDate = a.dateISO.localeCompare(b.dateISO)
    if (byDate !== 0) return byDate
    // À l'heure ; sans heure, un élément ouvre la journée. À égalité, le culte d'abord.
    const byTime = (a.time ?? '').localeCompare(b.time ?? '')
    if (byTime !== 0) return byTime
    return a.kind === b.kind ? 0 : a.kind === 'plan' ? -1 : 1
  })

  const days = items.reduce<[string, ProgramItem[]][]>((acc, item) => {
    const last = acc[acc.length - 1]
    if (last && last[0] === item.dateISO) last[1].push(item)
    else acc.push([item.dateISO, [item]])
    return acc
  }, [])

  const startDay = dayOf(gathering.startDate)

  /**
   * Candidats au rattachement : tout sauf ce qui est déjà ici, du plus récent
   * au plus ancien. Les dates étant au format YYYY-MM-DD, l'ordre
   * lexicographique inversé suffit.
   */
  function toCandidates<T extends { id: number; date: string; gathering?: unknown }>(
    docs: T[],
    label: (doc: T) => string,
    time: (doc: T) => string | null,
  ): AttachCandidate[] {
    return docs
      .filter((doc) => !belongsHere(doc.gathering))
      .map((doc) => {
        const hour = time(doc)
        return {
          day: dayOf(doc.date),
          candidate: {
            id: doc.id,
            label: label(doc),
            meta: hour
              ? `${formatDateShort(doc.date)} à ${formatTime(hour)}`
              : formatDateShort(doc.date),
            attachedTo: attachedGathering(doc.gathering)?.title ?? null,
          },
        }
      })
      .sort((a, b) => b.day.localeCompare(a.day))
      .map((row) => row.candidate)
  }

  const eventCandidates = toCandidates(
    allEvents,
    (e) => e.title,
    (e) => e.time ?? null,
  )
  const planCandidates = toCandidates(
    allPlans,
    (p) => servicePlanTitle(p.title),
    (p) => p.time ?? null,
  )

  const newEventHref = `/dashboard/events/new?gathering=${gathering.id}&date=${startDay}`
  const newPlanHref = `/dashboard/planning/new?gathering=${gathering.id}&date=${startDay}`

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/gatherings"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux rassemblements
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">{gathering.title}</h1>
            <p className="mt-1 text-muted-foreground">
              {formatDateRange(gathering.startDate, gathering.endDate)}
            </p>
          </div>
          {isAdmin && (
            <div className="flex shrink-0 items-center gap-2">
              <Link href={`/dashboard/gatherings/${gathering.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Modifier</span>
                </Button>
              </Link>
              <GatheringActions
                gatheringId={gathering.id}
                gatheringTitle={gathering.title}
                canDelete={isAdmin}
              />
            </div>
          )}
        </div>

        {gathering.location && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {gathering.location}
          </p>
        )}
        {gathering.description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{gathering.description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Programme
        </h2>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <AttachPicker
              gatheringId={gathering.id}
              collection="events"
              candidates={eventCandidates}
              createHref={newEventHref}
              labels={{
                trigger: 'Événement',
                create: 'Créer un événement',
                search: 'Rechercher un événement...',
                empty: 'Aucun autre événement à rattacher.',
                one: 'Événement',
                many: 'événements',
              }}
            />
            <AttachPicker
              gatheringId={gathering.id}
              collection="service-plans"
              candidates={planCandidates}
              createHref={newPlanHref}
              labels={{
                trigger: 'Culte',
                create: 'Créer un culte',
                search: 'Rechercher un culte...',
                empty: 'Aucun autre culte à rattacher.',
                one: 'Culte',
                many: 'cultes',
              }}
            />
          </div>
        )}
      </div>

      {days.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-raisin/15 py-12 text-center text-muted-foreground">
          <p className="font-medium">Programme vide</p>
          <p className="mt-1 max-w-md text-sm">
            Utilisez « Événement » ou « Culte » ci-dessus : vous pourrez en créer un, ou
            rattacher ceux qui existent déjà.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {days.map(([dayISO, dayItems]) => (
            <div key={dayISO} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold capitalize">
                {formatFrenchDate(new Date(dayISO))}
              </h3>
              <div className="overflow-hidden rounded-lg border border-raisin/8">
                {dayItems.map((item, index) => (
                  <div
                    key={`${item.kind}-${item.id}`}
                    className={`relative flex items-center gap-3 bg-raisin/5 px-4 py-3 transition-colors hover:bg-raisin/10 ${
                      index > 0 ? 'border-t border-raisin/8' : ''
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="absolute inset-0"
                      aria-label={`Ouvrir ${item.title}`}
                    />
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        item.kind === 'plan'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.kind === 'plan' ? (
                        <Sun className="h-3.5 w-3.5" />
                      ) : (
                        <Calendar className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {item.title}
                    </span>
                    {item.kind === 'plan' && (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        Culte
                      </Badge>
                    )}
                    {item.time && (
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {formatTime(item.time)}
                      </span>
                    )}
                    {isAdmin && (
                      <div className="relative z-10">
                        <DetachButton
                          itemId={item.id}
                          collection={item.kind === 'plan' ? 'service-plans' : 'events'}
                          itemLabel={item.title}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
