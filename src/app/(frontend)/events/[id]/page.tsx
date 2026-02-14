import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock } from 'lucide-react'

import config from '@/payload.config'
import { getTenantSlug, getTenantBySlug } from '@/lib/tenant'
import { formatDate, formatTime } from '@/lib/format'
import { PublicHeader } from '@/components/layout/public-header'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const tenantSlug = getTenantSlug(headers)
  if (!tenantSlug) notFound()

  const tenant = await getTenantBySlug(payload, tenantSlug)
  if (!tenant) notFound()

  // Fetch l'événement
  let event
  try {
    event = await payload.findByID({
      collection: 'events',
      id,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  if (!event) notFound()

  // Vérifier que l'event appartient à ce tenant
  const eventChurchId = typeof event.church === 'object' ? event.church?.id : event.church
  if (String(eventChurchId) !== String(tenant.id)) notFound()

  // Event interne → 404 si pas connecté
  if (event.visibility === 'internal' && !user) notFound()

  const logoUrl = typeof tenant.logo === 'object' && tenant.logo?.url ? tenant.logo.url : null

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader churchName={tenant.name} logoUrl={logoUrl} isLoggedIn={!!user} />

      <div className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux événements
          </Link>

          <h1 className="text-2xl sm:text-3xl font-heading font-bold">{event.title}</h1>

          <div className="mt-4 flex flex-col gap-2 text-muted-foreground">
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="capitalize">{formatDate(event.date)}</span> à {formatTime(event.time)}
            </p>
            {event.location && (
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.location}
              </p>
            )}
          </div>

          {event.description && (
            <div className="mt-8 prose prose-sm max-w-none whitespace-pre-wrap">
              {event.description}
            </div>
          )}
        </div>
      </div>

      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {tenant.name}
      </footer>
    </div>
  )
}
