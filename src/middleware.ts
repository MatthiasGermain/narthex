import { NextRequest, NextResponse } from 'next/server'

const TENANT_HEADER = 'x-tenant-slug'
const CUSTOM_DOMAIN_HEADER = 'x-custom-domain'

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

/** Détecte si c'est un domaine custom (2-parts, pas le domaine principal) */
function extractCustomDomain(req: NextRequest): string | null {
  const hostname = req.headers.get('host') || ''
  const cleanHost = hostname.replace(/:\d+$/, '')
  const parts = cleanHost.split('.')

  if (parts.length === 2 && !PLATFORM_DOMAINS.includes(cleanHost)) {
    return cleanHost
  }

  return null
}

export function middleware(req: NextRequest) {
  const slug = extractTenantSlug(req)

  if (slug) {
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set(TENANT_HEADER, slug)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Domaine custom → passer le domaine au serveur pour résolution
  const customDomain = extractCustomDomain(req)
  if (customDomain) {
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set(CUSTOM_DOMAIN_HEADER, customDomain)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclure: /_next, /admin, /api, fichiers statiques
    '/((?!_next|admin|api|favicon.ico|[^/]+\\.[^/]+$).*)',
  ],
}
