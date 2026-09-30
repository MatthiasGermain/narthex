'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'

import { resolveTenant } from '@/lib/tenant'
import { isAdminRole } from '@/access'
import { checkUserTenantAccess } from '@/lib/tenant-check'

/**
 * Génère (ou régénère) le token de partage du planning pour l'église courante.
 *
 * `resolveTenant()` déduit l'église du header Host, pas du compte, et le garde
 * du layout dashboard ne s'applique pas aux server actions : sans le contrôle
 * d'appartenance, un admin de A poste l'action sur le domaine de B et récupère
 * un lien public vers tout le planning de B.
 */
export async function generatePlanningShareToken(): Promise<
  { token: string } | { error: string }
> {
  const { payload, user, tenant } = await resolveTenant()
  if (!user || !tenant || !isAdminRole(user) || !checkUserTenantAccess(user, tenant.id)) {
    return { error: 'Non autorisé' }
  }

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
  if (!user || !tenant || !isAdminRole(user) || !checkUserTenantAccess(user, tenant.id)) {
    return { error: 'Non autorisé' }
  }

  await payload.update({
    collection: 'churches',
    id: tenant.id,
    data: { planningShareToken: null },
    overrideAccess: true,
  })

  revalidatePath('/dashboard/planning')
  return { ok: true }
}
