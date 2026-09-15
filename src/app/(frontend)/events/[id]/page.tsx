import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MapPin, Clock, Calendar, FileText } from 'lucide-react'
import type { Metadata } from 'next'
import type { Payload } from 'payload'

import { resolveTenant } from '@/lib/tenant'
import { formatDate, formatTime } from '@/lib/format'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { TenantTheme } from '@/components/tenant-theme'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { Button } from '@/components/ui/button'
import { getEventThumb, getEventAlt } from '@/components/public/event-card'

export const revalidate = 60

const getEvent = cache(async (payload: Payload, id: number | string) => {
  try {
    return await payload.findByID({
      collection: 'events',
      id,
      depth: 1,
      overrideAccess: true,
    })
  } catch (err) {
    console.error(err)
    return null
  }
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { payload, tenant } = await resolveTenant()
  if (!tenant) return {}
  const event = await getEvent(payload, id)
  if (!event) return {}
  const description = `${event.title} — ${formatDate(event.date)} à ${formatTime(event.time)}${event.location ? ` — ${event.location}` : ''}`
  const ogImage = getEventThumb(event.image) || undefined
  return {
    title: `${event.title} | ${tenant.name}`,
    description,
    openGraph: {
      title: `${event.title} | ${tenant.name}`,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { payload, user, tenant, branding, profile, logoUrl } = await resolveTenant()

  if (!tenant) notFound()

  const event = await getEvent(payload, id)
  if (!event) notFound()

  // Vérifier que l'event appartient à ce tenant
  const eventChurchId = typeof event.church === 'object' ? event.church?.id : event.church
  if (String(eventChurchId) !== String(tenant.id)) notFound()

  // Event interne → 404 si pas connecté
  if (event.visibility === 'internal' && !user) notFound()

  const heroImage = getEventThumb(event.image)
  const heroAlt = getEventAlt(event.image, event.title)
  const posterPdfUrl = typeof event.posterPdf === 'object' ? (event.posterPdf?.url ?? null) : null

  return (
    <div className="min-h-screen flex flex-col">
      <TenantTheme colors={branding?.colors || {}} />
      <PublicHeader churchName={tenant.name} logoUrl={logoUrl} isLoggedIn={!!user} />

      {/* ── Image hero ── */}
      <div className="pt-20 sm:pt-24">
        {heroImage ? (
          <div className="w-full max-h-96 overflow-hidden">
            <Image
              src={heroImage}
              alt={heroAlt}
              width={1920}
              height={600}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 sm:h-64 bg-linear-to-br from-raisin/80 to-violet/60 flex items-center justify-center">
            <Calendar className="h-16 w-16 text-cream/30" />
          </div>
        )}
      </div>

      {/* ── Contenu ── */}
      <section className="bg-cream flex-1 px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <Button asChild variant="raisin" size="sm" className="mb-6">
              <Link href="/events">
                <ArrowLeft className="h-4 w-4" />
                Tous les événements
              </Link>
            </Button>
          </ScrollReveal>

          <ScrollReveal>
            <h1 className="font-heading font-black text-3xl sm:text-4xl uppercase tracking-wide leading-snug text-raisin">
              {event.title}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mt-5 flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-sunglow/15 px-4 py-1.5 text-sm font-medium text-raisin">
                <Clock className="h-4 w-4 text-sunglow" />
                <span className="capitalize">{formatDate(event.date)}</span> à {formatTime(event.time)}
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-2 rounded-full bg-violet/15 px-4 py-1.5 text-sm font-medium text-raisin">
                  <MapPin className="h-4 w-4 text-violet" />
                  {event.location}
                </span>
              )}
            </div>
          </ScrollReveal>

          {event.description && (
            <ScrollReveal delay={0.2}>
              <div className="mt-8 text-raisin/70 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
            </ScrollReveal>
          )}

          {posterPdfUrl && (
            <ScrollReveal delay={0.3}>
              <div className="mt-10">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-heading font-black text-xl uppercase tracking-wide text-raisin">
                    Affiche
                  </h2>
                  <Button asChild variant="raisin" size="sm">
                    <a href={posterPdfUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4" />
                      Ouvrir le PDF
                    </a>
                  </Button>
                </div>
                {/* Aperçu intégré sur écran large : les navigateurs mobiles affichent mal les PDF en iframe */}
                <iframe
                  src={`${posterPdfUrl}#view=FitH`}
                  title={`Affiche — ${event.title}`}
                  className="hidden sm:block w-full h-[80vh] rounded-lg border border-raisin/10 bg-white"
                />
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <PublicFooter
        churchName={tenant.name}
        logoUrl={logoUrl}
        social={profile?.social}
      />
    </div>
  )
}
