import { NextRequest, NextResponse } from 'next/server'

const TENANT_HEADER = 'x-tenant-slug'

function extractTenantSlug(req: NextRequest): string | null {
  const hostname = req.headers.get('host') || ''

  // Dev: sous-domaine de *.localhost (ex: eglise-demo.localhost:3000)
  const localhostMatch = hostname.match(/^([^.]+)\.localhost(:\d+)?$/)
  if (localhostMatch && localhostMatch[1] !== 'www') {
    return localhostMatch[1]
  }

  // Prod: sous-domaine de *.narthex.fr ou autre domaine principal
  // (ex: eglise-demo.narthex.fr → "eglise-demo")
  const parts = hostname.replace(/:\d+$/, '').split('.')
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

export function middleware(req: NextRequest) {
  const slug = extractTenantSlug(req)

  if (!slug) {
    return NextResponse.next()
  }

  // Injecter le slug du tenant dans les headers de la requête
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
