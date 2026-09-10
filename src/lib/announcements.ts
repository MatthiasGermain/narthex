import type { Payload, Where } from 'payload'

import type { Event, ServicePlan } from '../payload-types'
import { isAdminRole } from '../access'

type FindUser = Parameters<Payload['find']>[0]['user']

/** Sans culte suivant planifié, la feuille couvre une semaine. */
export const DEFAULT_WINDOW_DAYS = 7
/** Un rassemblement s'annonce dès 30 jours avant son début. */
export const GATHERING_LEAD_DAYS = 30

export interface AnnouncementEvent {
  kind: 'event'
  id: number
  title: string
  /** Date Payload (ISO) */
  date: string
  /** HH:mm */
  time: string
  endTime: string | null
  /** Salle, à défaut lieu. */
  place: string | null
  description: string | null
  hidden: boolean
}

export interface AnnouncementGathering {
  kind: 'gathering'
  id: number
  title: string
  startDate: string
  endDate: string
  location: string | null
  description: string | null
  hidden: boolean
}

export interface AnnouncementExtra {
  kind: 'extra'
  /** Identifiant de la ligne du tableau Payload. */
  id: string
  title: string
  details: string | null
}

export type AnnouncementItem = AnnouncementEvent | AnnouncementGathering | AnnouncementExtra

export interface AnnouncementSheet {
  /** Fin de la période couverte, exclue (YYYY-MM-DD). */
  until: string
  /** true si la période s'arrête au culte suivant, false si elle couvre 7 jours faute de culte. */
  untilIsNextService: boolean
  /** Événements (chronologiques), puis rassemblements, puis annonces libres. */
  items: AnnouncementItem[]
  /** Ce qui sera effectivement lu : tout sauf les éléments masqués. */
  visibleCount: number
}

/** YYYY-MM-DD d'une date Payload. */
function dayOf(value: string): string {
  return new Date(value).toISOString().split('T')[0]
}

function addDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]
}

/** Id d'une relation, qu'elle soit brute (depth 0) ou peuplée. */
function relId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object') return (value as { id?: number }).id ?? null
  return null
}

function relIds(list: unknown): number[] {
  return (Array.isArray(list) ? list : []).map(relId).filter((id): id is number => id !== null)
}

/** Le rôle chargé des annonces. Les rôles sont libres : on compare sans accents ni casse. */
export function isPresidencyRole(role: string): boolean {
  return (
    role
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase() === 'presidence'
  )
}

/** Membres affectés à la Présidence de ce culte. */
export function presidingMemberIds(plan: Pick<ServicePlan, 'assignments'>): number[] {
  return (plan.assignments ?? [])
    .filter((a) => isPresidencyRole(a.role))
    .flatMap((a) => relIds(a.members))
}

/** Fiche membre reliée au compte, comme le fait le layout du dashboard. */
export async function findUserMemberId(
  payload: Payload,
  userId: number,
  churchId: number,
): Promise<number | null> {
  const { docs } = await payload.find({
    collection: 'members',
    where: { user: { equals: userId }, church: { equals: churchId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return docs[0]?.id ?? null
}

/**
 * Préparer la feuille d'annonces d'un culte : réservé aux admins et à la
 * personne qui préside CE culte — souvent un bénévole, qui ne peut pas
 * modifier le culte lui-même.
 */
export function canPrepareAnnouncements(
  user: Parameters<typeof isAdminRole>[0],
  plan: Pick<ServicePlan, 'assignments'>,
  memberId: number | null,
): boolean {
  if (isAdminRole(user)) return true
  return memberId !== null && presidingMemberIds(plan).includes(memberId)
}

function placeOf(event: Event): string | null {
  const room = event.room && typeof event.room === 'object' ? event.room.name : null
  return room ?? event.location ?? null
}

/**
 * Feuille d'annonces d'un culte, calculée à la demande depuis le calendrier :
 * un événement annulé ou déplacé disparaît de lui-même. Seuls les choix de la
 * présidence (masquages, annonces libres) sont lus depuis le culte.
 */
export async function buildAnnouncementSheet(
  payload: Payload,
  user: FindUser,
  plan: ServicePlan,
  churchId: number,
): Promise<AnnouncementSheet> {
  const planDay = dayOf(plan.date)

  const {
    docs: [nextPlan],
  } = await payload.find({
    collection: 'service-plans',
    where: {
      church: { equals: churchId },
      date: { greater_than: `${planDay}T23:59:59.999Z` },
    },
    sort: 'date',
    limit: 1,
    depth: 0,
    overrideAccess: false,
    user,
  })
  const until = nextPlan ? dayOf(nextPlan.date) : addDays(planDay, DEFAULT_WINDOW_DAYS)

  const eventsWhere: Where = {
    church: { equals: churchId },
    and: [
      { date: { greater_than_equal: `${planDay}T00:00:00.000Z` } },
      { date: { less_than: `${until}T00:00:00.000Z` } },
    ],
  }

  // En cours ou qui commencent dans le délai d'anticipation.
  const gatheringsWhere: Where = {
    church: { equals: churchId },
    and: [
      { endDate: { greater_than_equal: `${planDay}T00:00:00.000Z` } },
      { startDate: { less_than: `${addDays(planDay, GATHERING_LEAD_DAYS)}T00:00:00.000Z` } },
    ],
  }

  const [{ docs: events }, { docs: gatherings }] = await Promise.all([
    payload.find({
      collection: 'events',
      where: eventsWhere,
      sort: 'date',
      limit: 100,
      depth: 1,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'gatherings',
      where: gatheringsWhere,
      sort: 'startDate',
      limit: 20,
      depth: 0,
      overrideAccess: false,
      user,
    }),
  ])

  const hiddenEvents = new Set(relIds(plan.announcements?.hiddenEvents))
  const hiddenGatherings = new Set(relIds(plan.announcements?.hiddenGatherings))
  const announcedGatheringIds = new Set(gatherings.map((g) => g.id))

  const eventItems: AnnouncementEvent[] = events
    // Les événements d'un rassemblement annoncé sont couverts par son annonce.
    .filter((e) => {
      const gatheringId = relId(e.gathering)
      return gatheringId === null || !announcedGatheringIds.has(gatheringId)
    })
    .map((e) => ({
      kind: 'event' as const,
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      endTime: e.endTime ?? null,
      place: placeOf(e),
      description: e.description ?? null,
      hidden: hiddenEvents.has(e.id),
    }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const gatheringItems: AnnouncementGathering[] = gatherings.map((g) => ({
    kind: 'gathering' as const,
    id: g.id,
    title: g.title,
    startDate: g.startDate,
    endDate: g.endDate,
    location: g.location ?? null,
    description: g.description ?? null,
    hidden: hiddenGatherings.has(g.id),
  }))

  const extraItems: AnnouncementExtra[] = (plan.announcements?.extra ?? [])
    .filter((x) => Boolean(x.id))
    .map((x) => ({
      kind: 'extra' as const,
      id: x.id as string,
      title: x.title,
      details: x.details ?? null,
    }))

  const items: AnnouncementItem[] = [...eventItems, ...gatheringItems, ...extraItems]

  return {
    until,
    untilIsNextService: Boolean(nextPlan),
    items,
    visibleCount: items.filter((item) => item.kind === 'extra' || !item.hidden).length,
  }
}
