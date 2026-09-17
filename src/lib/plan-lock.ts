import type { Payload, Where } from 'payload'

/**
 * Verrou d'édition d'un culte, stocké dans `payload-locked-documents` : le même
 * que celui de l'admin Payload. L'API REST refuse donc d'elle-même (423) un
 * enregistrement venant de quelqu'un d'autre tant que le verrou est actif.
 */

/** Durée de vie d'un verrou qui n'est plus prolongé (secondes). */
export const PLAN_LOCK_DURATION_S = 180

const LOCKS = 'payload-locked-documents'

export interface PlanLockOwner {
  name: string
  /** Heure de début d'édition, déjà formatée (« 10h42 »). */
  since: string
}

export type AcquirePlanLockResult =
  | { ok: true }
  | { ok: false; lockedBy: PlanLockOwner }
  | { ok: false; changed: true }

function locksOf(planId: number): Where[] {
  return [
    { 'document.relationTo': { equals: 'service-plans' } },
    { 'document.value': { equals: planId } },
  ]
}

async function findActiveLock(payload: Payload, planId: number) {
  const {
    docs: [lock],
  } = await payload.find({
    collection: LOCKS,
    where: {
      and: [
        ...locksOf(planId),
        {
          updatedAt: {
            greater_than: new Date(Date.now() - PLAN_LOCK_DURATION_S * 1000).toISOString(),
          },
        },
      ],
    },
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (!lock) return null
  const ownerId = typeof lock.user.value === 'object' ? lock.user.value.id : lock.user.value
  return { id: lock.id, ownerId, lockedAt: lock.createdAt }
}

async function describeOwner(
  payload: Payload,
  userId: number,
  lockedAt: string,
): Promise<PlanLockOwner> {
  const {
    docs: [member],
  } = await payload.find({
    collection: 'members',
    where: { user: { equals: userId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  let name = member ? `${member.firstName} ${member.lastName}`.trim() : ''
  if (!name) {
    const user = await payload
      .findByID({ collection: 'users', id: userId, depth: 0, overrideAccess: true })
      .catch(() => null)
    name = user?.email ?? 'Un autre utilisateur'
  }

  const since = new Date(lockedAt)
    .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
    .replace(':', 'h')

  return { name, since }
}

/** Verrou actif posé par quelqu'un d'autre que `userId`, ou null si le culte est libre. */
export async function getPlanLockOwner(
  payload: Payload,
  planId: number,
  userId: number,
): Promise<PlanLockOwner | null> {
  const lock = await findActiveLock(payload, planId)
  if (!lock || lock.ownerId === userId) return null
  return describeOwner(payload, lock.ownerId, lock.lockedAt)
}

/** Pose le verrou de `userId`, ou le prolonge s'il le tient déjà. */
export async function acquirePlanLock(
  payload: Payload,
  planId: number,
  userId: number,
): Promise<AcquirePlanLockResult> {
  const lock = await findActiveLock(payload, planId)

  if (lock) {
    if (lock.ownerId !== userId) {
      return { ok: false, lockedBy: await describeOwner(payload, lock.ownerId, lock.lockedAt) }
    }
    // Mise à jour vide, comme l'admin Payload : repousse updatedAt, donc l'expiration.
    await payload.db.updateOne({ collection: LOCKS, id: lock.id, data: {}, returning: false })
    return { ok: true }
  }

  // Aucun verrou actif : on retire les verrous expirés avant d'en poser un neuf.
  await payload.delete({ collection: LOCKS, where: { and: locksOf(planId) }, overrideAccess: true })
  await payload.create({
    collection: LOCKS,
    data: {
      document: { relationTo: 'service-plans', value: planId },
      user: { relationTo: 'users', value: userId },
    },
    overrideAccess: true,
  })
  return { ok: true }
}

/** Retire le verrou de `userId` (sans effet sur celui de quelqu'un d'autre). */
export async function releasePlanLock(payload: Payload, planId: number, userId: number) {
  await payload.delete({
    collection: LOCKS,
    where: { and: [...locksOf(planId), { 'user.value': { equals: userId } }] },
    overrideAccess: true,
  })
}
