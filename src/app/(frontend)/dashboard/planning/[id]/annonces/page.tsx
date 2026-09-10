import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, Calendar, CalendarRange, Megaphone } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import {
  buildAnnouncementSheet,
  canPrepareAnnouncements,
  findUserMemberId,
  type AnnouncementEvent,
  type AnnouncementExtra,
  type AnnouncementGathering,
} from '@/lib/announcements'
import { formatDateRange, formatDateShort, formatTime, servicePlanTitle } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  ExtraAnnouncementForm,
  HideToggle,
  RemoveExtraButton,
} from '@/components/features/announcements/announcement-controls'

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-raisin/15 px-4 py-4 text-center text-sm text-muted-foreground">
      {children}
    </p>
  )
}

const listClass = 'overflow-hidden rounded-lg border border-raisin/8 divide-y divide-raisin/8'
const rowClass = 'flex items-center gap-3 bg-raisin/5 px-4 py-3'

export default async function PrepareAnnouncementsPage({
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

  const plan = await payload
    .findByID({ collection: 'service-plans', id: planId, depth: 0, overrideAccess: false, user })
    .catch(() => null)
  if (!plan) notFound()

  const planChurchId = typeof plan.church === 'object' ? plan.church?.id : plan.church
  if (String(planChurchId) !== String(tenant.id)) notFound()

  const [sheet, memberId] = await Promise.all([
    buildAnnouncementSheet(payload, user, plan, tenant.id),
    findUserMemberId(payload, user.id, tenant.id),
  ])
  const canPrepare = canPrepareAnnouncements(user, plan, memberId)

  const events = sheet.items.filter((i): i is AnnouncementEvent => i.kind === 'event')
  const gatherings = sheet.items.filter((i): i is AnnouncementGathering => i.kind === 'gathering')
  const extras = sheet.items.filter((i): i is AnnouncementExtra => i.kind === 'extra')

  const period = sheet.untilIsNextService
    ? `jusqu'au culte du ${formatDateShort(sheet.until)}`
    : 'sur les 7 jours suivants (aucun culte planifié après)'

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard/planning"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux cultes
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">Annonces</h1>
            <p className="mt-1 text-muted-foreground">
              {servicePlanTitle(plan.title)} du {formatDateShort(plan.date)} · {period}
            </p>
          </div>
          <Link href={`/annonces/${plan.id}`}>
            <Button size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              Lire au pupitre
            </Button>
          </Link>
        </div>
      </div>

      {!canPrepare && (
        <p className="rounded-lg border border-raisin/8 bg-raisin/5 px-4 py-3 text-sm text-muted-foreground">
          Lecture seule : seuls les admins et la personne qui préside ce culte peuvent modifier
          cette feuille.
          {memberId === null &&
            ' Votre compte n’est relié à aucune fiche membre : Narthex ne peut donc pas savoir si vous présidez.'}
        </p>
      )}

      <Section
        title="Événements"
        hint={canPrepare ? "Masquez ceux qu'il n'est pas utile d'annoncer." : undefined}
      >
        {events.length === 0 ? (
          <Empty>Aucun événement sur cette période.</Empty>
        ) : (
          <ul className={listClass}>
            {events.map((e) => (
              <li key={`event-${e.id}`} className={`${rowClass} ${e.hidden ? 'opacity-50' : ''}`}>
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {e.title}
                    {e.hidden && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">non annoncé</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateShort(e.date)} à {formatTime(e.time)}
                    {e.endTime ? ` – ${formatTime(e.endTime)}` : ''}
                    {e.place ? ` · ${e.place}` : ''}
                  </p>
                </div>
                {canPrepare && (
                  <HideToggle planId={plan.id} kind="event" itemId={e.id} hidden={e.hidden} label={e.title} />
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {gatherings.length > 0 && (
        <Section title="Rassemblements à venir" hint="En cours ou qui commencent dans les 30 jours.">
          <ul className={listClass}>
            {gatherings.map((g) => (
              <li key={`gathering-${g.id}`} className={`${rowClass} ${g.hidden ? 'opacity-50' : ''}`}>
                <CalendarRange className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {g.title}
                    {g.hidden && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">non annoncé</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateRange(g.startDate, g.endDate)}
                    {g.location ? ` · ${g.location}` : ''}
                  </p>
                </div>
                {canPrepare && (
                  <HideToggle
                    planId={plan.id}
                    kind="gathering"
                    itemId={g.id}
                    hidden={g.hidden}
                    label={g.title}
                  />
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section
        title="Annonces libres"
        hint="Ce qui n'est pas un événement : collecte, nouvelles des familles, appel à bénévoles."
      >
        {extras.length === 0 ? (
          !canPrepare && <Empty>Aucune annonce libre.</Empty>
        ) : (
          <ul className={listClass}>
            {extras.map((x) => (
              <li key={`extra-${x.id}`} className={rowClass}>
                <Megaphone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{x.title}</p>
                  {x.details && <p className="whitespace-pre-line text-xs text-muted-foreground">{x.details}</p>}
                </div>
                {canPrepare && <RemoveExtraButton planId={plan.id} extraId={x.id} label={x.title} />}
              </li>
            ))}
          </ul>
        )}
        {canPrepare && <ExtraAnnouncementForm planId={plan.id} />}
      </Section>
    </div>
  )
}
