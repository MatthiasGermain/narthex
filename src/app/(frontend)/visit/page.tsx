import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, Car, Baby, Timer, ListChecks, MapPin } from 'lucide-react'
import type { Metadata } from 'next'

import { resolveTenant } from '@/lib/tenant'
import { DAY_LABELS, formatServiceTime } from '@/lib/format'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { PublicPageHero } from '@/components/layout/public-page-hero'
import { TenantTheme } from '@/components/tenant-theme'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { AnimatedUnderline } from '@/components/landing/animated-underline'
import { Button } from '@/components/ui/button'
import { FaqAccordion } from '@/components/public/faq-accordion'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const { tenant } = await resolveTenant()
  if (!tenant) return {}
  return {
    title: `Première visite | ${tenant.name}`,
    description: `Tout ce qu'il faut savoir pour votre première visite à ${tenant.name}.`,
    openGraph: {
      title: `Première visite | ${tenant.name}`,
      description: `Tout ce qu'il faut savoir pour votre première visite à ${tenant.name}.`,
    },
  }
}

export default async function VisitPage() {
  const { user, tenant, branding, profile, logoUrl } = await resolveTenant()

  if (!tenant) notFound()

  const visitInfo = profile?.visitInfo
  const faq = (profile?.faq as { question: string; answer: string; id?: string }[]) ?? []
  const services = profile?.services ?? []
  const hasAddress = profile?.address?.street || profile?.address?.city
  const hasVisitInfo = visitInfo?.duration || visitInfo?.serviceFlow || visitInfo?.childrenInfo || visitInfo?.parking
  const hasContent = hasVisitInfo || faq.length > 0 || services.length > 0

  const infoCards = [
    { icon: Timer, label: 'Durée', value: visitInfo?.duration },
    { icon: ListChecks, label: 'Déroulé du culte', value: visitInfo?.serviceFlow },
    { icon: Baby, label: 'Accueil des enfants', value: visitInfo?.childrenInfo },
    { icon: Car, label: 'Parking / accès', value: visitInfo?.parking },
  ].filter(c => c.value)

  return (
    <div className="min-h-screen flex flex-col">
      <TenantTheme colors={branding?.colors || {}} />
      <PublicHeader churchName={tenant.name} logoUrl={logoUrl} isLoggedIn={!!user} />

      {/* ── Hero ── */}
      <PublicPageHero
        title="Votre première visite"
        highlight="première"
        subtitle="Tout ce qu'il faut savoir avant de venir"
        className="bg-cream"
      />

      {/* ── Infos pratiques ── */}
      {infoCards.length > 0 && (
        <section className="bg-cream/50 px-4 py-14">
          <div className="mx-auto max-w-4xl">
            <ScrollReveal>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-raisin mb-8 text-center">
                À quoi <AnimatedUnderline>s&apos;attendre</AnimatedUnderline> ?
              </h2>
            </ScrollReveal>
            <div className="grid gap-5 sm:grid-cols-2">
              {infoCards.map((card, i) => (
                <ScrollReveal key={card.label} delay={i * 0.1}>
                  <div className="rounded-xl bg-cream border border-raisin/8 p-6 shadow-[0_2px_12px_rgba(30,41,82,0.04)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-sunglow/15 shrink-0">
                        <card.icon className="h-5 w-5 text-sunglow" />
                      </div>
                      <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-raisin">
                        {card.label}
                      </h3>
                    </div>
                    <p className="text-raisin/70 text-sm leading-relaxed whitespace-pre-wrap">
                      {card.value}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Horaires & Accès ── */}
      {(services.length > 0 || hasAddress) && (
        <section className="bg-raisin px-4 py-14">
          <div className="mx-auto max-w-4xl">
            <ScrollReveal>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-cream mb-8 text-center">
                Quand et <AnimatedUnderline>où</AnimatedUnderline> ?
              </h2>
            </ScrollReveal>
            <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
              {services.map((service, i) => (
                <ScrollReveal key={service.id || service.label} delay={i * 0.1}>
                  <div className="rounded-xl bg-cream/10 border border-cream/10 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-sunglow" />
                      <span className="font-heading font-bold text-sm uppercase tracking-wide text-sunglow">
                        {DAY_LABELS[service.day] || service.day}
                      </span>
                    </div>
                    <p className="text-cream font-medium">{service.label}</p>
                    <p className="text-cream/60 text-sm mt-0.5">{formatServiceTime(service.time)}</p>
                  </div>
                </ScrollReveal>
              ))}
              {hasAddress && (
                <ScrollReveal delay={services.length * 0.1}>
                  <div className="rounded-xl bg-cream/10 border border-cream/10 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-sunglow" />
                      <span className="font-heading font-bold text-sm uppercase tracking-wide text-sunglow">
                        Adresse
                      </span>
                    </div>
                    <p className="text-cream font-medium">
                      {profile!.address!.street && <>{profile!.address!.street}<br /></>}
                      {profile!.address!.postalCode} {profile!.address!.city}
                    </p>
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {faq.length > 0 && (
        <section className="bg-violet/10 px-4 py-14">
          <div className="mx-auto max-w-3xl">
            <ScrollReveal>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-raisin mb-8 text-center">
                Questions <AnimatedUnderline>fréquentes</AnimatedUnderline>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <FaqAccordion items={faq} />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── CTA Contact ── */}
      <section className="bg-cream px-4 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-raisin mb-4">
              Une question ?
            </h2>
            <p className="text-raisin/60 mb-6">
              N&apos;hésitez pas à nous contacter, nous serons ravis de vous accueillir.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Button asChild variant="sunglow" size="default">
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Fallback ── */}
      {!hasContent && (
        <section className="bg-cream flex-1 px-4 py-14">
          <p className="text-raisin/50 text-center">
            Les informations pour les visiteurs seront bientôt disponibles.
          </p>
        </section>
      )}

      <PublicFooter churchName={tenant.name} logoUrl={logoUrl} social={profile?.social} />
    </div>
  )
}
