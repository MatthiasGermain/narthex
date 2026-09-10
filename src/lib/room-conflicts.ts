import type { Payload, Where } from 'payload'

import { servicePlanTitle } from './format'
import { toMinutes } from './time'

export type BookingKind = 'event' | 'plan'

/**
 * Durée supposée quand l'heure de fin manque. Sans elle, une réservation
 * n'occuperait qu'un instant et deux créneaux ne se chevaucheraient jamais,
 * sauf à commencer à la même minute.
 */
export const ASSUMED_DURATION_MINUTES: Record<BookingKind, number> = {
  event: 60,
  plan: 90,
}

export interface RoomConflict {
  kind: BookingKind
  id: number
  title: string
  /** HH:mm */
  time: string
  /** HH:mm, ou null quand la fin n'est pas renseignée (durée supposée). */
  endTime: string | null
}

export interface FindRoomConflictsInput {
  churchId: number
  roomId: number
  /** YYYY-MM-DD */
  date: string
  /** HH:mm */
  time: string
  endTime?: string | null
  kind: BookingKind
  /** L'élément en cours d'édition, qui ne doit pas se signaler lui-même. */
  excludeId?: number
}

/** Créneau en minutes depuis minuit, fin exclue. */
function slot(
  kind: BookingKind,
  time: string | null | undefined,
  endTime: string | null | undefined,
): [number, number] | null {
  const start = toMinutes(time)
  if (start === null) return null
  const end = toMinutes(endTime)
  return [start, end !== null && end > start ? end : start + ASSUMED_DURATION_MINUTES[kind]]
}

/**
 * Événements et cultes qui occupent la même salle sur un créneau qui
 * chevauche celui demandé. Les droits de lecture de l'utilisateur
 * s'appliquent (`overrideAccess: false`).
 */
export async function findRoomConflicts(
  payload: Payload,
  user: Parameters<Payload['find']>[0]['user'],
  input: FindRoomConflictsInput,
): Promise<RoomConflict[]> {
  const target = slot(input.kind, input.time, input.endTime)
  if (!target) return []

  // Même découpage de journée que les requêtes du dashboard et du calendrier.
  const where: Where = {
    church: { equals: input.churchId },
    room: { equals: input.roomId },
    date: {
      greater_than_equal: `${input.date}T00:00:00.000Z`,
      less_than_equal: `${input.date}T23:59:59.999Z`,
    },
  }

  const [events, plans] = await Promise.all([
    payload.find({
      collection: 'events',
      where,
      limit: 100,
      depth: 0,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'service-plans',
      where,
      limit: 100,
      depth: 0,
      overrideAccess: false,
      user,
    }),
  ])

  const bookings = [
    ...events.docs.map((e) => ({
      kind: 'event' as const,
      id: e.id,
      title: e.title,
      time: e.time as string | null,
      endTime: e.endTime ?? null,
    })),
    ...plans.docs.map((p) => ({
      kind: 'plan' as const,
      id: p.id,
      title: servicePlanTitle(p.title),
      time: p.time ?? null,
      endTime: p.endTime ?? null,
    })),
  ]

  const conflicts: RoomConflict[] = []
  for (const booking of bookings) {
    if (booking.kind === input.kind && booking.id === input.excludeId) continue
    // Un culte sans heure ne peut pas être placé dans la journée : on n'invente rien.
    if (!booking.time) continue
    const other = slot(booking.kind, booking.time, booking.endTime)
    if (!other) continue
    if (target[0] < other[1] && other[0] < target[1]) {
      conflicts.push({
        kind: booking.kind,
        id: booking.id,
        title: booking.title,
        time: booking.time,
        endTime: booking.endTime,
      })
    }
  }

  return conflicts.sort((a, b) => a.time.localeCompare(b.time))
}
