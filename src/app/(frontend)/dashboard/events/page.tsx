import Link from 'next/link'
import Image from 'next/image'
import { CalendarPlus, CalendarX } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { formatDateShort, formatTime, isPast } from '@/lib/format'
import { canDeleteOwned, isAdminRole } from '@/access'
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


export default async function EventsPage() {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const { docs: events } = await payload.find({
    collection: 'events',
    where: {
      church: { equals: tenant.id },
    },
    sort: 'date',
    limit: 100,
    depth: 1,
    overrideAccess: false,
    user,
  })

  const upcoming = events.filter((e) => !isPast(e.date))
  const past = events.filter((e) => isPast(e.date)).reverse()

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

      {events.length === 0 ? (
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
                {upcoming.map((event) => (
                  <div
                    key={event.id}
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
                ))}
              </div>
            )}

            {past.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Passés</h2>
                {past.map((event) => (
                  <div
                    key={event.id}
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
                      {upcoming.map((event) => (
                        <TableRow key={event.id} className="relative cursor-pointer hover:bg-raisin/5">
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
                      {past.map((event) => (
                        <TableRow key={event.id} className="relative cursor-pointer hover:bg-raisin/5">
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
    {isAdmin && <BulkActionBar collection="events" noun={{ one: 'événement', many: 'événements' }} />}
    </BulkSelectProvider>
  )
}
