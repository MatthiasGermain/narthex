import { Fragment } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarPlus, CalendarX, CalendarRange } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { formatDateShort, formatTime } from '@/lib/format'
import { getTodayISO } from '@/lib/date-utils'
import { canDeleteOwned, isAdminRole } from '@/access'
import { PAGE_SIZE, UPCOMING_LIMIT, parsePage, type SearchParams } from '@/lib/pagination'
import { Pagination } from '@/components/features/pagination'
import { getThumbUrl } from '@/lib/image-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EventActions } from '@/components/features/events/event-actions'
import {
  BulkSelectProvider,
  BulkCheckbox,
  BulkSelectAll,
  BulkActionBar,
} from '@/components/features/bulk-select'

function getRoomName(room: unknown): string | null {
  if (!room || typeof room !== 'object') return null
  return (room as { name?: string }).name || null
}

function getLocationLabel(event: { room?: unknown; location?: string | null }): string {
  const roomName = getRoomName(event.room)
  if (roomName && event.location) return `${roomName} — ${event.location}`
  if (roomName) return roomName
  return event.location || ''
}


interface GatheringRef {
  id: number
  title: string
}

/** Le rassemblement d'un événement, une fois peuplé par `depth: 1`. */
function gatheringOf(event: { gathering?: unknown }): GatheringRef | null {
  const g = event.gathering
  return g && typeof g === 'object' && 'title' in g ? (g as GatheringRef) : null
}

/**
 * Marque la première ligne de chaque rassemblement pour y poser un en-tête.
 * La liste étant triée par date, les éléments d'un même rassemblement se
 * suivent ; un rassemblement entrecoupé par un événement isolé reprend un
 * en-tête, ce qui reste fidèle à la chronologie affichée.
 */
function withGroupHeaders<T extends { id: number; gathering?: unknown }>(list: T[]) {
  let currentId: number | null = null
  return list.map((event) => {
    const gathering = gatheringOf(event)
    const header = gathering && gathering.id !== currentId ? gathering : null
    currentId = gathering ? gathering.id : null
    return { header, event }
  })
}

function GatheringHeading({ gathering }: { gathering: GatheringRef }) {
  return (
    <Link
      href={`/dashboard/gatherings/${gathering.id}`}
      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
    >
      <CalendarRange className="h-3.5 w-3.5" />
      {gathering.title}
    </Link>
  )
}

function GatheringHeadingRow({
  gathering,
  colSpan,
}: {
  gathering: GatheringRef
  colSpan: number
}) {
  return (
    <TableRow className="bg-primary/5 hover:bg-primary/5">
      <TableCell colSpan={colSpan} className="py-2">
        <GatheringHeading gathering={gathering} />
      </TableCell>
    </TableRow>
  )
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const params = await searchParams
  const pastPage = parsePage(params.passes)
  const today = getTodayISO()

  // Deux requêtes plutôt qu'un tri unique découpé en mémoire : avec un seul
  // `sort: 'date'` plafonné, les événements passés finissaient par occuper
  // toute la page et les événements à venir disparaissaient de la liste.
  const [upcomingResult, pastResult] = await Promise.all([
    payload.find({
      collection: 'events',
      where: { church: { equals: tenant.id }, date: { greater_than_equal: today } },
      sort: 'date',
      limit: UPCOMING_LIMIT,
      depth: 1,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'events',
      where: { church: { equals: tenant.id }, date: { less_than: today } },
      sort: '-date',
      limit: PAGE_SIZE,
      page: pastPage,
      depth: 1,
      overrideAccess: false,
      user,
    }),
  ])

  const upcoming = upcomingResult.docs
  const past = pastResult.docs
  const isEmpty = upcoming.length === 0 && pastResult.totalDocs === 0

  const isAdmin = isAdminRole(user)
  const upcomingIds = upcoming.map((e) => e.id)
  const pastIds = past.map((e) => e.id)

  return (
    <BulkSelectProvider>
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Événements</h1>
        <Link href="/dashboard/events/new">
          <Button size="sm">
            <CalendarPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ajouter</span>
          </Button>
        </Link>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <CalendarX className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucun événement</p>
          <p className="text-sm mt-1">Créez votre premier événement pour commencer.</p>
          <Link href="/dashboard/events/new" className="mt-4">
            <Button variant="outline">
              <CalendarPlus className="h-4 w-4 mr-2" />
              Créer un événement
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-6 sm:hidden">
            {upcoming.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">À venir</h2>
                {withGroupHeaders(upcoming).map(({ header, event }) => (
                  <Fragment key={event.id}>
                  {header && <GatheringHeading gathering={header} />}
                  <div
                    className="relative flex items-start justify-between gap-3 rounded-lg border border-raisin/8 bg-raisin/5 p-4"
                  >
                    <Link
                      href={`/dashboard/events/${event.id}/edit`}
                      className="absolute inset-0"
                      aria-label={`Ouvrir ${event.title}`}
                    />
                    {isAdmin && (
                      <div className="relative z-10 pt-0.5">
                        <BulkCheckbox id={event.id} label={`Sélectionner ${event.title}`} />
                      </div>
                    )}
                    {getThumbUrl(event.image) && (
                      <Image
                        src={getThumbUrl(event.image)!}
                        alt={event.title}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDateShort(event.date)} à {formatTime(event.time)}
                      </p>
                      {getLocationLabel(event) && (
                        <p className="text-sm text-muted-foreground">{getLocationLabel(event)}</p>
                      )}
                      <Badge
                        variant="outline"
                        className={`mt-2 ${event.visibility === 'public' ? 'border-primary/40 text-primary' : 'border-muted-foreground/40 text-muted-foreground'}`}
                      >
                        {event.visibility === 'public' ? 'Public' : 'Interne'}
                      </Badge>
                    </div>
                    <div className="relative z-10">
                      <EventActions
                        eventId={event.id}
                        eventTitle={event.title}
                        canDelete={canDeleteOwned(event, user.id, user.role)}
                      />
                    </div>
                  </div>
                  </Fragment>
                ))}
              </div>
            )}

            {past.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Passés</h2>
                {withGroupHeaders(past).map(({ header, event }) => (
                  <Fragment key={event.id}>
                  {header && <GatheringHeading gathering={header} />}
                  <div
                    className="relative flex items-start justify-between gap-3 rounded-lg border border-raisin/8 bg-raisin/5 p-4 opacity-60"
                  >
                    <Link
                      href={`/dashboard/events/${event.id}/edit`}
                      className="absolute inset-0"
                      aria-label={`Ouvrir ${event.title}`}
                    />
                    {isAdmin && (
                      <div className="relative z-10 pt-0.5">
                        <BulkCheckbox id={event.id} label={`Sélectionner ${event.title}`} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDateShort(event.date)} à {formatTime(event.time)}
                      </p>
                      {getLocationLabel(event) && (
                        <p className="text-sm text-muted-foreground">{getLocationLabel(event)}</p>
                      )}
                    </div>
                    <div className="relative z-10">
                      <EventActions
                        eventId={event.id}
                        eventTitle={event.title}
                        canDelete={canDeleteOwned(event, user.id, user.role)}
                      />
                    </div>
                  </div>
                  </Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:flex sm:flex-col sm:gap-6">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">À venir</h2>
                <div className="rounded-lg border border-raisin/8 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-raisin/8">
                        {isAdmin && (
                          <TableHead className="w-10">
                            <BulkSelectAll ids={upcomingIds} label="Tout sélectionner (à venir)" />
                          </TableHead>
                        )}
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="w-[28%]">Titre</TableHead>
                        <TableHead className="w-[23%]">Date</TableHead>
                        <TableHead className="w-[8%]">Heure</TableHead>
                        <TableHead className="w-[18%]">Lieu</TableHead>
                        <TableHead className="w-[12%]">Visibilité</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withGroupHeaders(upcoming).map(({ header, event }) => (
                        <Fragment key={event.id}>
                        {header && (
                          <GatheringHeadingRow gathering={header} colSpan={isAdmin ? 8 : 7} />
                        )}
                        <TableRow className="relative cursor-pointer hover:bg-raisin/5">
                          {isAdmin && (
                            <TableCell className="relative z-10 w-px">
                              <BulkCheckbox id={event.id} label={`Sélectionner ${event.title}`} />
                            </TableCell>
                          )}
                          <TableCell>
                            <Link
                              href={`/dashboard/events/${event.id}/edit`}
                              className="absolute inset-0"
                              aria-label={`Ouvrir ${event.title}`}
                            />
                            {getThumbUrl(event.image) ? (
                              <Image
                                src={getThumbUrl(event.image)!}
                                alt={event.title}
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded object-cover"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded bg-muted" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateShort(event.date)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatTime(event.time)}</TableCell>
                          <TableCell className="text-muted-foreground">{getLocationLabel(event) || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={event.visibility === 'public' ? 'border-primary/40 text-primary' : 'border-muted-foreground/40 text-muted-foreground'}>
                              {event.visibility === 'public' ? 'Public' : 'Interne'}
                            </Badge>
                          </TableCell>
                          <TableCell className="relative z-10 w-px">
                            <EventActions
                              eventId={event.id}
                              eventTitle={event.title}
                              canDelete={canDeleteOwned(event, user.id, user.role)}
                            />
                          </TableCell>
                        </TableRow>
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Passés</h2>
                <div className="rounded-lg border border-raisin/8 overflow-hidden opacity-60">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-raisin/8">
                        {isAdmin && (
                          <TableHead className="w-10">
                            <BulkSelectAll ids={pastIds} label="Tout sélectionner (passés)" />
                          </TableHead>
                        )}
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="w-[28%]">Titre</TableHead>
                        <TableHead className="w-[23%]">Date</TableHead>
                        <TableHead className="w-[8%]">Heure</TableHead>
                        <TableHead className="w-[18%]">Lieu</TableHead>
                        <TableHead className="w-[12%]">Visibilité</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withGroupHeaders(past).map(({ header, event }) => (
                        <Fragment key={event.id}>
                        {header && (
                          <GatheringHeadingRow gathering={header} colSpan={isAdmin ? 8 : 7} />
                        )}
                        <TableRow className="relative cursor-pointer hover:bg-raisin/5">
                          {isAdmin && (
                            <TableCell className="relative z-10 w-px">
                              <BulkCheckbox id={event.id} label={`Sélectionner ${event.title}`} />
                            </TableCell>
                          )}
                          <TableCell>
                            <Link
                              href={`/dashboard/events/${event.id}/edit`}
                              className="absolute inset-0"
                              aria-label={`Ouvrir ${event.title}`}
                            />
                            {getThumbUrl(event.image) ? (
                              <Image
                                src={getThumbUrl(event.image)!}
                                alt={event.title}
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded object-cover"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded bg-muted" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateShort(event.date)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatTime(event.time)}</TableCell>
                          <TableCell className="text-muted-foreground">{getLocationLabel(event) || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">
                              {event.visibility === 'public' ? 'Public' : 'Interne'}
                            </Badge>
                          </TableCell>
                          <TableCell className="relative z-10 w-px">
                            <EventActions
                              eventId={event.id}
                              eventTitle={event.title}
                              canDelete={canDeleteOwned(event, user.id, user.role)}
                            />
                          </TableCell>
                        </TableRow>
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          <Pagination
            basePath="/dashboard/events"
            searchParams={params}
            param="passes"
            page={pastPage}
            totalPages={pastResult.totalPages}
            label="des événements passés"
          />
        </>
      )}
    </div>
    {isAdmin && <BulkActionBar collection="events" noun={{ one: 'événement', many: 'événements' }} />}
    </BulkSelectProvider>
  )
}
