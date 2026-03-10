import { cache } from 'react'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

import config from '@/payload.config'

const TENANT_HEADER = 'x-tenant-slug'
const CUSTOM_DOMAIN_HEADER = 'x-custom-domain'

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
    depth: 0,
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
  let tenant = tenantSlug ? await getTenantBySlug(payload, tenantSlug) : null

  // Résolution domaine custom (ex: church-test.dev)
  if (!tenant) {
    const customDomain = headers.get(CUSTOM_DOMAIN_HEADER)
    if (customDomain) {
      const result = await payload.find({
        collection: 'churches',
        where: { domain: { equals: customDomain } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      tenant = result.docs[0] || null
    }
  }

  // Fetch branding et profile en parallèle (1:1 par tenant)
  const [branding, profile] = tenant
    ? await Promise.all([
        payload
          .find({
            collection: 'church-branding',
            where: { church: { equals: tenant.id } },
            limit: 1,
            depth: 1,
            overrideAccess: true,
          })
          .then((r) => r.docs[0] || null),
        payload
          .find({
            collection: 'church-profiles',
            where: { church: { equals: tenant.id } },
            limit: 1,
            depth: 0,
            overrideAccess: true,
          })
          .then((r) => r.docs[0] || null),
      ])
    : [null, null]

  const logoUrl =
    typeof branding?.logo === 'object' && branding.logo?.url
      ? branding.logo.url
      : null

  return { headers, payload, user, tenantSlug, tenant, branding, profile, logoUrl }
})
