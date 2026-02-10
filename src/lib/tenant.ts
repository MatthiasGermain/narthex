import type { Payload } from 'payload'

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
