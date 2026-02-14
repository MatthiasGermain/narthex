import { cache } from 'react'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

import config from '@/payload.config'

const TENANT_HEADER = 'x-tenant-slug'

/**
 * Lit le slug du tenant depuis les headers de la requête.
 * Le header est injecté par le middleware.
 */
export function getTenantSlug(headers: Headers): string | null {
  return headers.get(TENANT_HEADER)
}

/**
 * Récupère une église depuis son slug via Payload Local API.
 * Utilise overrideAccess car la collection Churches est restreinte aux super-admins.
 */
export async function getTenantBySlug(payload: Payload, slug: string) {
  const result = await payload.find({
    collection: 'churches',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  return result.docs[0] || null
}

/**
 * Résout le tenant courant en un seul appel (headers → slug → DB).
 * Déduplication automatique par React.cache() dans un même request.
 * Retourne aussi payload et user pour éviter les appels redondants.
 */
export const resolveTenant = cache(async () => {
  const headers = await getHeaders()
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers })

  const tenantSlug = getTenantSlug(headers)
  const tenant = tenantSlug ? await getTenantBySlug(payload, tenantSlug) : null

  // Fetch branding et profile (1:1 par tenant)
  const branding = tenant
    ? await payload
        .find({
          collection: 'church-branding',
          where: { church: { equals: tenant.id } },
          limit: 1,
          overrideAccess: true,
        })
        .then((r) => r.docs[0] || null)
    : null

  const profile = tenant
    ? await payload
        .find({
          collection: 'church-profiles',
          where: { church: { equals: tenant.id } },
          limit: 1,
          overrideAccess: true,
        })
        .then((r) => r.docs[0] || null)
    : null

  return { headers, payload, user, tenantSlug, tenant, branding, profile }
})
