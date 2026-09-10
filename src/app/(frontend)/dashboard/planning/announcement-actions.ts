'use server'

import { revalidatePath } from 'next/cache'
import type { Payload } from 'payload'

import type { ServicePlan } from '@/payload-types'
import { resolveTenant } from '@/lib/tenant'
import { checkUserTenantAccess } from '@/lib/tenant-check'
import { canPrepareAnnouncements, findUserMemberId } from '@/lib/announcements'

type Result = { ok: true } | { error: string }

interface AnnouncementsData {
  hiddenEvents: number[]
  hiddenGatherings: number[]
  extra: { id?: string; title: string; details: string | null }[]
}

const TITLE_MAX = 200
const DETAILS_MAX = 2000

/**
 * Charge le culte et vérifie le droit de préparer ses annonces. La collection
 * réserve la modification des cultes aux admins : on contrôle ici un droit plus
 * étroit (admin, ou présidence de CE culte), puis on n'écrit que le groupe
 * `announcements`, en contournant l'accès de la collection.
 */
async function loadForPreparation(
  planId: number,
): Promise<{ payload: Payload; plan: ServicePlan } | { error: string }> {
  const { payload, user, tenant } = await resolveTenant()
  if (!user || !tenant || !checkUserTenantAccess(user, tenant.id)) {
    return { error: 'Non autorisé' }
  }
  if (!Number.isInteger(planId)) return { error: 'Culte introuvable' }

  const plan = await payload
    .findByID({ collection: 'service-plans', id: planId, depth: 0, overrideAccess: true })
    .catch(() => null)
  const planChurchId = plan && (typeof plan.church === 'object' ? plan.church?.id : plan.church)
  if (!plan || String(planChurchId) !== String(tenant.id)) return { error: 'Culte introuvable' }

  const memberId = await findUserMemberId(payload, user.id, tenant.id)
  if (!canPrepareAnnouncements(user, plan, memberId)) return { error: 'Non autorisé' }

  return { payload, plan }
}

function toIds(list: unknown): number[] {
  return (Array.isArray(list) ? list : [])
    .map((v) => (v && typeof v === 'object' ? (v as { id?: number }).id : v))
    .filter((v): v is number => typeof v === 'number')
}

/** Le groupe complet est toujours renvoyé, pour ne jamais effacer un sous-champ par omission. */
function currentAnnouncements(plan: ServicePlan): AnnouncementsData {
  return {
    hiddenEvents: toIds(plan.announcements?.hiddenEvents),
    hiddenGatherings: toIds(plan.announcements?.hiddenGatherings),
    extra: (plan.announcements?.extra ?? []).map((x) => ({
      id: x.id ?? undefined,
      title: x.title,
      details: x.details ?? null,
    })),
  }
}

async function save(payload: Payload, planId: number, data: AnnouncementsData): Promise<Result> {
  await payload.update({
    collection: 'service-plans',
    id: planId,
    data: { announcements: data },
    overrideAccess: true,
  })
  revalidatePath(`/dashboard/planning/${planId}/annonces`)
  revalidatePath(`/annonces/${planId}`)
  revalidatePath('/dashboard')
  return { ok: true }
}

/** Masque ou réintègre un événement ou un rassemblement dans la feuille. */
export async function setAnnouncementHidden(input: {
  planId: number
  kind: 'event' | 'gathering'
  itemId: number
  hidden: boolean
}): Promise<Result> {
  if (
    (input.kind !== 'event' && input.kind !== 'gathering') ||
    !Number.isInteger(input.itemId) ||
    typeof input.hidden !== 'boolean'
  ) {
    return { error: 'Paramètres invalides' }
  }

  const ctx = await loadForPreparation(input.planId)
  if ('error' in ctx) return ctx

  const data = currentAnnouncements(ctx.plan)
  const key = input.kind === 'event' ? 'hiddenEvents' : 'hiddenGatherings'
  const ids = new Set(data[key])
  if (input.hidden) ids.add(input.itemId)
  else ids.delete(input.itemId)
  data[key] = [...ids]

  return save(ctx.payload, ctx.plan.id, data)
}

/** Ajoute une annonce libre (collecte, nouvelle d'une famille, appel à bénévoles…). */
export async function addExtraAnnouncement(input: {
  planId: number
  title: string
  details?: string
}): Promise<Result> {
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const details = typeof input.details === 'string' ? input.details.trim() : ''
  if (!title) return { error: 'Le titre est requis' }
  if (title.length > TITLE_MAX) return { error: `Titre trop long (${TITLE_MAX} caractères max.)` }
  if (details.length > DETAILS_MAX) return { error: `Détails trop longs (${DETAILS_MAX} caractères max.)` }

  const ctx = await loadForPreparation(input.planId)
  if ('error' in ctx) return ctx

  const data = currentAnnouncements(ctx.plan)
  data.extra.push({ title, details: details || null })

  return save(ctx.payload, ctx.plan.id, data)
}

/** Retire une annonce libre. */
export async function removeExtraAnnouncement(input: {
  planId: number
  extraId: string
}): Promise<Result> {
  if (typeof input.extraId !== 'string' || !input.extraId) return { error: 'Paramètres invalides' }

  const ctx = await loadForPreparation(input.planId)
  if ('error' in ctx) return ctx

  const data = currentAnnouncements(ctx.plan)
  const before = data.extra.length
  data.extra = data.extra.filter((x) => x.id !== input.extraId)
  if (data.extra.length === before) return { error: 'Annonce introuvable' }

  return save(ctx.payload, ctx.plan.id, data)
}
