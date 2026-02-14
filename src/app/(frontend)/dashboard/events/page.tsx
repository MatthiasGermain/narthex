import Link from 'next/link'
import { CalendarPlus, CalendarX } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { formatDateShort, formatTime } from '@/lib/format'
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

function isPast(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr) < today
}

function canUserDelete(
  event: { createdBy?: number | { id: number } | null },
  userId: number,
  userRole: string,
): boolean {
  if (userRole === 'super-admin' || userRole === 'admin-church') return true
  const creatorId = typeof event.createdBy === 'object' ? event.createdBy?.id : event.createdBy
  return creatorId === userId
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
    overrideAccess: false,
    user,
  })

  const upcoming = events.filter((e) => !isPast(e.date))
  const past = events.filter((e) => isPast(e.date)).reverse()

  return (
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
                    className="flex items-start justify-between gap-3 rounded-lg border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDateShort(event.date)} à {formatTime(event.time)}
                      </p>
                      {event.location && (
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      )}
                      <Badge
                        variant="outline"
                        className={`mt-2 ${event.visibility === 'public' ? 'border-primary/40 text-primary' : 'border-muted-foreground/40 text-muted-foreground'}`}
                      >
                        {event.visibility === 'public' ? 'Public' : 'Interne'}
                      </Badge>
                    </div>
                    <EventActions
                      eventId={event.id}
                      eventTitle={event.title}
                      canDelete={canUserDelete(event, user.id, user.role)}
                    />
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
                    className="flex items-start justify-between gap-3 rounded-lg border p-4 opacity-60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{event.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDateShort(event.date)} à {formatTime(event.time)}
                      </p>
                      {event.location && (
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      )}
                    </div>
                    <EventActions
                      eventId={event.id}
                      eventTitle={event.title}
                      canDelete={canUserDelete(event, user.id, user.role)}
                    />
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
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[30%]">Titre</TableHead>
                        <TableHead className="w-[25%]">Date</TableHead>
                        <TableHead className="w-[8%]">Heure</TableHead>
                        <TableHead className="w-[20%]">Lieu</TableHead>
                        <TableHead className="w-[12%]">Visibilité</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcoming.map((event) => (
                        <TableRow key={event.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateShort(event.date)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatTime(event.time)}</TableCell>
                          <TableCell className="text-muted-foreground">{event.location || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={event.visibility === 'public' ? 'border-primary/40 text-primary' : 'border-muted-foreground/40 text-muted-foreground'}>
                              {event.visibility === 'public' ? 'Public' : 'Interne'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <EventActions
                              eventId={event.id}
                              eventTitle={event.title}
                              canDelete={canUserDelete(event, user.id, user.role)}
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
                <div className="rounded-lg border overflow-hidden opacity-60">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[30%]">Titre</TableHead>
                        <TableHead className="w-[25%]">Date</TableHead>
                        <TableHead className="w-[8%]">Heure</TableHead>
                        <TableHead className="w-[20%]">Lieu</TableHead>
                        <TableHead className="w-[12%]">Visibilité</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {past.map((event) => (
                        <TableRow key={event.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateShort(event.date)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatTime(event.time)}</TableCell>
                          <TableCell className="text-muted-foreground">{event.location || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground">
                              {event.visibility === 'public' ? 'Public' : 'Interne'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <EventActions
                              eventId={event.id}
                              eventTitle={event.title}
                              canDelete={canUserDelete(event, user.id, user.role)}
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
  )
}
