import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock } from 'lucide-react'
import type { Metadata } from 'next'

import { resolveTenant } from '@/lib/tenant'
import { formatDate, formatTime } from '@/lib/format'
import { PublicHeader } from '@/components/layout/public-header'
import { TenantTheme } from '@/components/tenant-theme'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { payload, tenant } = await resolveTenant()
  if (!tenant) return {}
  try {
    const event = await payload.findByID({ collection: 'events', id, overrideAccess: true })
    const description = `${event.title} — ${formatDate(event.date)} à ${formatTime(event.time)}${event.location ? ` — ${event.location}` : ''}`
    return {
      title: `${event.title} | ${tenant.name}`,
      description,
      openGraph: { title: `${event.title} | ${tenant.name}`, description },
    }
  } catch {
    return {}
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { payload, user, tenant, branding } = await resolveTenant()

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

  const logoUrl = typeof branding?.logo === 'object' && branding.logo?.url ? branding.logo.url : null

  return (
    <div className="min-h-screen flex flex-col">
      <TenantTheme colors={branding?.colors || {}} />
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
