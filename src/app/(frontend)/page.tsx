import Link from 'next/link'
import {
  Calendar,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react'
import type { Metadata } from 'next'

import { resolveTenant } from '@/lib/tenant'
import { getTodayISO } from '@/lib/date-utils'
import { DAY_LABELS, formatServiceTime } from '@/lib/format'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { PublicPageHero } from '@/components/layout/public-page-hero'
import { TenantTheme } from '@/components/tenant-theme'
import { WaitingPage } from '@/components/landing/waiting-page'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { Button } from '@/components/ui/button'
import { ContactInfoItems } from '@/components/public/contact-info-items'
import { EventCard } from '@/components/public/event-card'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const { tenant, profile } = await resolveTenant()
  if (!tenant) {
    return {
      title: 'Narthex, la plateforme pour les églises',
      description: 'Une plateforme pensée pour les églises. Votre site web, votre communauté, vos cultes, une solution adaptée à vos besoins.',
    }
  }
  const description = profile?.description
    ? profile.description.slice(0, 160)
    : `Bienvenue à ${tenant.name}. Découvrez nos événements et rejoignez notre communauté.`
  return {
    title: tenant.name,
    description,
    openGraph: { title: tenant.name, description },
  }
}

export default async function HomePage() {
  const { payload, user, tenant, branding, profile, logoUrl } = await resolveTenant()

  if (!tenant) {
    return <WaitingPage />
  }

  const { docs: upcomingEvents } = await payload.find({
    collection: 'events',
    where: {
      church: { equals: tenant.id },
      visibility: { equals: 'public' },
      date: { greater_than_equal: getTodayISO() },
    },
    sort: 'date',
    limit: 3,
    depth: 1,
    overrideAccess: true,
  })

  const hasServices = profile?.services && profile.services.length > 0
  const hasAddress = profile?.address?.street || profile?.address?.city
  const hasBand = hasServices || hasAddress
  const hasInfo = profile?.contact?.email || profile?.contact?.phone

  const heroDescription = profile?.description
    ? profile.description.length > 200
      ? profile.description.slice(0, 200).replace(/\s+\S*$/, '') + '…'
      : profile.description
    : null

  return (
    <div className="min-h-screen flex flex-col">
      <TenantTheme colors={branding?.colors || {}} />
      <PublicHeader churchName={tenant.name} logoUrl={logoUrl} isLoggedIn={!!user} />

      {/* ── Hero ── */}
      <PublicPageHero
        title={`Bienvenue à ${tenant.name}`}
        highlight={tenant.name}
        subtitle={heroDescription || 'Découvrez nos événements et rejoignez notre communauté.'}
        className="bg-cream"
      >
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg" variant="sunglow">
            <Link href="/events">
              <Calendar className="h-4 w-4" />
              Nos événements
            </Link>
          </Button>
          <Button asChild size="lg" variant="violet">
            <Link href="/about">
              En savoir plus
            </Link>
          </Button>
        </div>
      </PublicPageHero>

      {/* ── Bandeau infos clés ── */}
      {hasBand && (
        <ScrollReveal>
          <section className="bg-raisin px-4 py-8">
            <div className="mx-auto max-w-5xl flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {hasAddress && (
                <div className="flex items-center gap-2 text-sm text-cream/80">
                  <MapPin className="h-4 w-4 text-sunglow" />
                  <span>
                    {profile!.address!.street && <>{profile!.address!.street}, </>}
                    {profile!.address!.postalCode} {profile!.address!.city}
                  </span>
                </div>
              )}
              {hasServices && hasAddress && (
                <span className="hidden sm:block text-cream/20">|</span>
              )}
              {hasServices && (
                <>
                  <div className="flex items-center gap-2 font-heading font-bold text-sm uppercase tracking-wide text-cream">
                    <Clock className="h-4 w-4 text-sunglow" />
                    Nos cultes
                  </div>
                  {profile!.services!.map((service) => (
                    <div key={service.id || service.label} className="text-sm text-cream/60">
                      <span className="font-medium text-sunglow">{DAY_LABELS[service.day] || service.day}</span>
                      {' — '}
                      {service.label}
                      {' — '}
                      <span className="font-medium text-cream">{formatServiceTime(service.time)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ── Prochains événements ── */}
      <section className="bg-cream/50 px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-raisin mb-8 text-center">
              Prochains événements
            </h2>
          </ScrollReveal>
          {upcomingEvents.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event, i) => (
                  <ScrollReveal key={event.id} delay={i * 0.1}>
                    <EventCard event={event} />
                  </ScrollReveal>
                ))}
              </div>
              <ScrollReveal>
                <div className="mt-8 text-center">
                  <Button asChild variant="sunglow" size="default">
                    <Link href="/events">
                      Voir tous les événements
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </ScrollReveal>
            </>
          ) : (
            <ScrollReveal>
              <p className="text-raisin/50 text-center py-8">
                Aucun événement à venir pour le moment.
              </p>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── Infos pratiques ── */}
      {hasInfo && (
        <section className="bg-violet/10 px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <ScrollReveal>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-raisin mb-8 text-center">
                Infos pratiques
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto">
                <ContactInfoItems address={profile?.address} contact={profile?.contact} />
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <PublicFooter
        churchName={tenant.name}
        logoUrl={logoUrl}
        social={profile?.social}
      />
    </div>
  )
}
