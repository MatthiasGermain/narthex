import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { cacheTags } from '@/lib/cache'

const TENANT_HEADER = 'x-tenant-slug'
const CUSTOM_DOMAIN_HEADER = 'x-custom-domain'

// Église / branding / profil changent rarement → cache cross-requêtes.
// Invalidé immédiatement via revalidateTag lors d'une modif (cf. hooks des
// collections) ; ce TTL n'est qu'un filet de sécurité.
const TENANT_CACHE_TTL = 3600

/**
 * Lit le slug du tenant depuis les headers de la requête.
 * Le header est injecté par le middleware.
 */
export function getTenantSlug(headers: Headers): string | null {
  return headers.get(TENANT_HEADER)
}

/**
 * Récupère une église depuis son slug (mis en cache, invalidé par tag).
 * Utilise overrideAccess car la collection Churches est restreinte aux super-admins.
 */
function getTenantBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const result = await payload.find({
        collection: 'churches',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      return result.docs[0] || null
    },
    ['church-by-slug', slug],
    { tags: [cacheTags.churchSlug(slug)], revalidate: TENANT_CACHE_TTL },
  )()
}

/** Récupère une église depuis son domaine custom (mis en cache, invalidé par tag). */
function getTenantByDomain(domain: string) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const result = await payload.find({
        collection: 'churches',
        where: { domain: { equals: domain } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      return result.docs[0] || null
    },
    ['church-by-domain', domain],
    { tags: [cacheTags.churchDomain(domain)], revalidate: TENANT_CACHE_TTL },
  )()
}

/** Branding d'une église (mis en cache, invalidé par tag). */
function getBrandingByChurch(churchId: number) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const result = await payload.find({
        collection: 'church-branding',
        where: { church: { equals: churchId } },
        limit: 1,
        depth: 1,
        overrideAccess: true,
      })
      return result.docs[0] || null
    },
    ['branding-by-church', String(churchId)],
    { tags: [cacheTags.branding(churchId)], revalidate: TENANT_CACHE_TTL },
  )()
}

/** Profil public d'une église (mis en cache, invalidé par tag). */
function getProfileByChurch(churchId: number) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: await config })
      const result = await payload.find({
        collection: 'church-profiles',
        where: { church: { equals: churchId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      return result.docs[0] || null
    },
    ['profile-by-church', String(churchId)],
    { tags: [cacheTags.profile(churchId)], revalidate: TENANT_CACHE_TTL },
  )()
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
  let tenant = tenantSlug ? await getTenantBySlug(tenantSlug) : null

  // Résolution domaine custom (ex: church-test.dev)
  if (!tenant) {
    const customDomain = headers.get(CUSTOM_DOMAIN_HEADER)
    if (customDomain) {
      tenant = await getTenantByDomain(customDomain)
    }
  }

  // Fetch branding et profile en parallèle (1:1 par tenant), mis en cache
  const [branding, profile] = tenant
    ? await Promise.all([getBrandingByChurch(tenant.id), getProfileByChurch(tenant.id)])
    : [null, null]

  const logoUrl =
    typeof branding?.logo === 'object' && branding.logo?.url
      ? branding.logo.url
      : null

  return { headers, payload, user, tenantSlug, tenant, branding, profile, logoUrl }
})
