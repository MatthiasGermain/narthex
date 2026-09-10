'use server'

import { resolveTenant } from '@/lib/tenant'
import { checkUserTenantAccess } from '@/lib/tenant-check'
import { findRoomConflicts, type BookingKind, type RoomConflict } from '@/lib/room-conflicts'

const TIME = /^\d{2}:\d{2}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

export interface CheckRoomConflictsInput {
  kind: BookingKind
  roomId: number
  /** YYYY-MM-DD */
  date: string
  /** HH:mm */
  time: string
  endTime?: string | null
  /** L'élément en cours d'édition, qui ne doit pas se signaler lui-même. */
  excludeId?: number
}

/**
 * Vérifie, pendant la saisie, qu'une salle est libre sur un créneau.
 * Ouvert à tout membre de l'église courante et pas seulement aux admins :
 * un bénévole peut créer des événements, il doit donc être prévenu.
 */
export async function checkRoomConflicts(
  input: CheckRoomConflictsInput,
): Promise<{ conflicts: RoomConflict[] } | { error: string }> {
  const { payload, user, tenant } = await resolveTenant()
  if (!user || !tenant || !checkUserTenantAccess(user, tenant.id)) {
    return { error: 'Non autorisé' }
  }

  // Une server action est appelable directement : on ne se fie pas au formulaire.
  if (
    (input.kind !== 'event' && input.kind !== 'plan') ||
    !Number.isInteger(input.roomId) ||
    !DATE.test(input.date) ||
    !TIME.test(input.time) ||
    (input.endTime != null && !TIME.test(input.endTime)) ||
    (input.excludeId != null && !Number.isInteger(input.excludeId))
  ) {
    return { error: 'Paramètres invalides' }
  }

  const conflicts = await findRoomConflicts(payload, user, {
    churchId: tenant.id,
    roomId: input.roomId,
    date: input.date,
    time: input.time,
    endTime: input.endTime ?? null,
    kind: input.kind,
    excludeId: input.excludeId,
  })

  return { conflicts }
}
