'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'

import { resolveTenant } from '@/lib/tenant'
import { isAdminRole } from '@/access'

/** Génère (ou régénère) le token de partage du planning pour l'église courante. */
export async function generatePlanningShareToken(): Promise<
  { token: string } | { error: string }
> {
  const { payload, user, tenant } = await resolveTenant()
  if (!user || !tenant || !isAdminRole(user)) return { error: 'Non autorisé' }

  const token = randomBytes(24).toString('base64url')
  await payload.update({
    collection: 'churches',
    id: tenant.id,
    data: { planningShareToken: token },
    overrideAccess: true,
  })

  revalidatePath('/dashboard/planning')
  return { token }
}

/** Révoque le lien de partage : l'ancien lien cesse de fonctionner. */
export async function revokePlanningShareToken(): Promise<{ ok: true } | { error: string }> {
  const { payload, user, tenant } = await resolveTenant()
  if (!user || !tenant || !isAdminRole(user)) return { error: 'Non autorisé' }

  await payload.update({
    collection: 'churches',
    id: tenant.id,
    data: { planningShareToken: null },
    overrideAccess: true,
  })

  revalidatePath('/dashboard/planning')
  return { ok: true }
}
