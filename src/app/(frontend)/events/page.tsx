import { notFound } from 'next/navigation'
import { CalendarX } from 'lucide-react'
import type { Metadata } from 'next'

import { resolveTenant } from '@/lib/tenant'
import { formatDate } from '@/lib/format'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { PublicPageHero } from '@/components/layout/public-page-hero'
import { TenantTheme } from '@/components/tenant-theme'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { EventCard } from '@/components/public/event-card'
import Link from 'next/link'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const { tenant } = await resolveTenant()
  if (!tenant) return {}
  return {
    title: `Événements | ${tenant.name}`,
    description: `Consultez les prochains événements de ${tenant.name}.`,
    openGraph: {
      title: `Événements | ${tenant.name}`,
      description: `Consultez les prochains événements de ${tenant.name}.`,
    },
  }
}

export default async function PublicEventsPage() {
  const { payload, user, tenant, branding, profile, logoUrl } = await resolveTenant()

  if (!tenant) notFound()

  const { docs: events } = await payload.find({
    collection: 'events',
    where: {
      church: { equals: tenant.id },
      visibility: { equals: 'public' },
    },
    sort: 'date',
    limit: 100,
    depth: 1,
    overrideAccess: true,
  })

  const now = new Date().toISOString().split('T')[0]
  const upcoming = events.filter((e) => e.date >= now)
  const past = events.filter((e) => e.date < now).reverse()

  return (
    <div className="min-h-screen flex flex-col">
      <TenantTheme colors={branding?.colors || {}} />
      <PublicHeader churchName={tenant.name} logoUrl={logoUrl} isLoggedIn={!!user} />

      {/* ── Hero ── */}
      <PublicPageHero
        title="Événements"
        highlight="Événements"
        subtitle="Découvrez nos prochaines activités et rejoignez-nous."
        className="bg-cream"
      />

      {/* ── Événements à venir ── */}
      <section className="bg-cream/50 px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-raisin mb-8 text-center">
              À venir
            </h2>
          </ScrollReveal>
          {upcoming.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event, i) => (
                <ScrollReveal key={event.id} delay={i * 0.1}>
                  <EventCard event={event} aspect="aspect-video" />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal>
              <div className="flex flex-col items-center justify-center py-16">
                <CalendarX className="h-12 w-12 mb-4 text-raisin/20" />
                <p className="text-raisin/50">Aucun événement à venir pour le moment.</p>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── Événements passés ── */}
      {past.length > 0 && (
        <section className="bg-violet/10 px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <ScrollReveal>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-raisin/60 mb-8 text-center">
                Événements passés
              </h2>
            </ScrollReveal>
            <div className="grid gap-3 max-w-3xl mx-auto">
              {past.map((event, i) => (
                <ScrollReveal key={event.id} delay={i * 0.05}>
                  <Link href={`/events/${event.id}`} className="group block">
                    <div className="rounded-lg bg-cream/60 border border-raisin/6 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 transition-all duration-200 group-hover:bg-cream/80 group-hover:shadow-sm">
                      <p className="font-heading font-medium text-sm text-raisin/70">{event.title}</p>
                      <p className="text-xs text-raisin/40 whitespace-nowrap">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
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
