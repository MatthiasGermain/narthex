import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, Globe, Facebook, Instagram, Youtube } from 'lucide-react'
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
import { ContactInfoItems } from '@/components/public/contact-info-items'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const { tenant, profile } = await resolveTenant()
  if (!tenant) return {}
  const description = profile?.description
    ? profile.description.slice(0, 160)
    : `Découvrez ${tenant.name} : horaires, adresse et contact.`
  return {
    title: `À propos | ${tenant.name}`,
    description,
    openGraph: {
      title: `À propos | ${tenant.name}`,
      description,
    },
  }
}

export default async function AboutPage() {
  const { user, tenant, branding, profile, logoUrl } = await resolveTenant()

  if (!tenant) notFound()

  const hasAddress = profile?.address?.street || profile?.address?.city
  const hasContact = profile?.contact?.email || profile?.contact?.phone || profile?.contact?.website
  const hasSocial = profile?.social?.facebook || profile?.social?.instagram || profile?.social?.youtube
  const hasServices = profile?.services && profile.services.length > 0

  return (
    <div className="min-h-screen flex flex-col">
      <TenantTheme colors={branding?.colors || {}} />
      <PublicHeader churchName={tenant.name} logoUrl={logoUrl} isLoggedIn={!!user} />

      {/* ── Hero ── */}
      <PublicPageHero
        title="À propos"
        subtitle="Apprenez à nous connaître"
        className="bg-cream"
      />

      {/* ── Qui sommes-nous ── */}
      {profile?.description && (
        <section className="bg-cream/50 px-4 py-14">
          <div className="mx-auto max-w-3xl">
            <ScrollReveal>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-raisin mb-6 text-center">
                Qui sommes-<AnimatedUnderline>nous</AnimatedUnderline> ?
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-raisin/70 leading-relaxed whitespace-pre-wrap text-center">
                {profile.description}
              </p>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── Nos cultes ── */}
      {hasServices && (
        <section className="bg-raisin px-4 py-14">
          <div className="mx-auto max-w-3xl">
            <ScrollReveal>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-cream mb-8 text-center">
                Nos cultes
              </h2>
            </ScrollReveal>
            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
              {profile!.services!.map((service, i) => (
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
            </div>
          </div>
        </section>
      )}

      {/* ── Nous trouver + Nous contacter ── */}
      {(hasAddress || hasContact) && (
        <section className="bg-violet/10 px-4 py-14">
          <div className="mx-auto max-w-3xl">
            <ScrollReveal>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-raisin mb-8 text-center">
                Nous trouver
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-2xl mx-auto">
                <ContactInfoItems address={profile?.address} contact={profile?.contact} />
                {profile?.contact?.website && (
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-sunglow/15 shrink-0">
                      <Globe className="h-5 w-5 text-sunglow" />
                    </div>
                    <div className="text-sm">
                      <p className="font-heading font-bold text-raisin">Site web</p>
                      <Link
                        href={profile.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-raisin/60 hover:text-raisin transition-colors"
                      >
                        Site web
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="mt-8 text-center">
                <Button asChild variant="sunglow" size="default">
                  <Link href="/contact">
                    Nous écrire
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── Réseaux sociaux ── */}
      {hasSocial && (
        <section className="bg-cream px-4 py-14">
          <div className="mx-auto max-w-3xl text-center">
            <ScrollReveal>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-raisin mb-8">
                Suivez-nous
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="flex flex-wrap justify-center gap-4">
                {profile!.social!.facebook && (
                  <Button asChild variant="raisin" size="default">
                    <Link href={profile!.social!.facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Link>
                  </Button>
                )}
                {profile!.social!.instagram && (
                  <Button asChild variant="violet" size="default">
                    <Link href={profile!.social!.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Link>
                  </Button>
                )}
                {profile!.social!.youtube && (
                  <Button asChild variant="sunglow" size="default">
                    <Link href={profile!.social!.youtube} target="_blank" rel="noopener noreferrer">
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </Link>
                  </Button>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── Fallback ── */}
      {!profile?.description && !hasServices && !hasAddress && !hasContact && !hasSocial && (
        <section className="bg-cream flex-1 px-4 py-14">
          <p className="text-raisin/50 text-center">
            Les informations de cette église seront bientôt disponibles.
          </p>
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
