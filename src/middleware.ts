import { NextRequest, NextResponse } from 'next/server'

const TENANT_HEADER = 'x-tenant-slug'

/** Domaine principal — pas de tenant */
const PLATFORM_DOMAINS = ['narthex.dev', 'www.narthex.dev']

function extractTenantSlug(req: NextRequest): string | null {
  const hostname = req.headers.get('host') || ''
  const cleanHost = hostname.replace(/:\d+$/, '')

  // Ignorer le domaine principal (pas de tenant)
  if (PLATFORM_DOMAINS.includes(cleanHost)) {
    return null
  }

  // Dev: sous-domaine de *.localhost (ex: eglise-demo.localhost:3000)
  const localhostMatch = hostname.match(/^([^.]+)\.localhost(:\d+)?$/)
  if (localhostMatch && localhostMatch[1] !== 'www') {
    return localhostMatch[1]
  }

  // Prod: sous-domaine de *.narthex.dev (ex: eap.narthex.dev → "eap")
  const parts = cleanHost.split('.')
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0]
  }

  // Fallback dev: query param ?tenant=slug
  const tenantParam = req.nextUrl.searchParams.get('tenant')
  if (tenantParam) {
    return tenantParam
  }

  return null
}

/**
 * Résout un domaine custom (ex: church-test.dev) vers le slug du tenant
 * en interrogeant l'API Payload interne.
 */
async function resolveCustomDomain(req: NextRequest): Promise<string | null> {
  const hostname = req.headers.get('host') || ''
  const cleanHost = hostname.replace(/:\d+$/, '')

  // Seulement pour les domaines 2-parts qui ne sont pas le domaine principal
  const parts = cleanHost.split('.')
  if (parts.length !== 2 || PLATFORM_DOMAINS.includes(cleanHost)) {
    return null
  }

  try {
    const internalOrigin = process.env.NODE_ENV === 'production'
      ? 'http://localhost:3000'
      : req.nextUrl.origin
    const apiUrl = `${internalOrigin}/api/resolve-tenant?domain=${encodeURIComponent(cleanHost)}`
    const res = await fetch(apiUrl)

    if (!res.ok) return null

    const data = await res.json()
    return data.slug || null
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  // 1. Résolution rapide (sous-domaines, localhost, query param)
  let slug = extractTenantSlug(req)

  // 2. Si pas trouvé, essayer la résolution par domaine custom
  if (!slug) {
    slug = await resolveCustomDomain(req)
  }

  if (!slug) {
    return NextResponse.next()
  }

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set(TENANT_HEADER, slug)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    // Exclure: /_next, /admin, /api, fichiers statiques
    '/((?!_next|admin|api|favicon.ico|[^/]+\\.[^/]+$).*)',
  ],
}
