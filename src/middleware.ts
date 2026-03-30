import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

const TENANT_HEADER = 'x-tenant-slug'
const CUSTOM_DOMAIN_HEADER = 'x-custom-domain'

/** Domaine principal — pas de tenant */
const PLATFORM_DOMAINS = ['narthex.dev', 'www.narthex.dev']

/** Endpoints avec rate limiting */
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/users/login': { limit: 15, windowMs: 15 * 60 * 1000 },
  '/api/users/forgot-password': { limit: 3, windowMs: 15 * 60 * 1000 },
  '/api/users/reset-password': { limit: 5, windowMs: 15 * 60 * 1000 },
  '/api/users': { limit: 10, windowMs: 15 * 60 * 1000 },
  '/api/members': { limit: 20, windowMs: 15 * 60 * 1000 },
  '/api/events': { limit: 20, windowMs: 15 * 60 * 1000 },
  '/api/rooms': { limit: 10, windowMs: 15 * 60 * 1000 },
  '/api/media': { limit: 30, windowMs: 15 * 60 * 1000 },
  '/api/invitations/accept': { limit: 5, windowMs: 15 * 60 * 1000 },
  '/api/invitations': { limit: 10, windowMs: 15 * 60 * 1000 },
  '/api/groups': { limit: 20, windowMs: 15 * 60 * 1000 },
}

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

  // Fallback dev uniquement: query param ?tenant=slug
  if (process.env.NODE_ENV !== 'production') {
    const tenantParam = req.nextUrl.searchParams.get('tenant')
    if (tenantParam) {
      return tenantParam
    }
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

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // --- Rate limiting sur les endpoints auth ---
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (pathname === path && req.method === 'POST') {
      const ip = getClientIp(req)
      const key = `${ip}:${path}`
      if (!checkRateLimit(key, config.limit, config.windowMs)) {
        return NextResponse.json(
          { errors: [{ message: 'Trop de tentatives. Réessayez dans 15 minutes.' }] },
          { status: 429 },
        )
      }
    }
  }

  // --- Laisser passer les autres routes /api/ sans tenant resolution ---
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // --- Tenant resolution pour les pages frontend ---
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
    // Exclure: /_next, /admin, fichiers statiques
    '/((?!_next|admin|favicon.ico|[^/]+\\.[^/]+$).*)',
  ],
}
