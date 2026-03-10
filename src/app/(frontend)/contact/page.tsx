import { notFound } from 'next/navigation'
import { Clock } from 'lucide-react'
import type { Metadata } from 'next'

import { resolveTenant } from '@/lib/tenant'
import { DAY_LABELS, formatServiceTime } from '@/lib/format'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { PublicPageHero } from '@/components/layout/public-page-hero'
import { TenantTheme } from '@/components/tenant-theme'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { ContactForm } from '@/components/contact-form'
import { ContactInfoItems } from '@/components/public/contact-info-items'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const { tenant } = await resolveTenant()
  if (!tenant) return {}
  return {
    title: `Contact | ${tenant.name}`,
    description: `Contactez ${tenant.name}. Envoyez-nous un message, nous vous répondrons rapidement.`,
    openGraph: {
      title: `Contact | ${tenant.name}`,
      description: `Contactez ${tenant.name}. Envoyez-nous un message, nous vous répondrons rapidement.`,
    },
  }
}

export default async function ContactPage() {
  const { user, tenant, branding, profile, logoUrl } = await resolveTenant()

  if (!tenant) notFound()

  const hasAddress = profile?.address?.street || profile?.address?.city
  const hasContact = profile?.contact?.email || profile?.contact?.phone
  const hasServices = profile?.services && profile.services.length > 0
  const hasInfos = hasAddress || hasContact || hasServices

  return (
    <div className="min-h-screen flex flex-col">
      <TenantTheme colors={branding?.colors || {}} />
      <PublicHeader churchName={tenant.name} logoUrl={logoUrl} isLoggedIn={!!user} />

      {/* ── Hero ── */}
      <PublicPageHero
        title="Nous contacter"
        highlight="contacter"
        subtitle="Une question ? N'hésitez pas à nous écrire."
        className="bg-cream"
      />

      {/* ── Formulaire + Infos ── */}
      <section className="bg-cream/50 flex-1 px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <div className={`grid gap-12 ${hasInfos ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
            {/* Formulaire */}
            <ScrollReveal>
              <div className="rounded-xl bg-cream/80 border border-raisin/8 p-6 sm:p-8">
                <h2 className="font-heading font-black text-xl sm:text-2xl uppercase tracking-wide text-raisin mb-6">
                  Envoyez-nous un message
                </h2>
                <ContactForm />
              </div>
            </ScrollReveal>

            {/* Infos pratiques */}
            {hasInfos && (
              <ScrollReveal delay={0.1}>
                <div className="space-y-8">
                  <ContactInfoItems address={profile?.address} contact={profile?.contact} />

                  {hasServices && (
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-sunglow/15 shrink-0">
                        <Clock className="h-5 w-5 text-sunglow" />
                      </div>
                      <div className="text-sm">
                        <p className="font-heading font-bold text-raisin">Horaires des cultes</p>
                        <div className="mt-1 space-y-1">
                          {profile!.services!.map((service) => (
                            <p key={service.id || service.label} className="text-raisin/60">
                              <span className="font-medium text-raisin/80">{DAY_LABELS[service.day] || service.day}</span>
                              {' — '}
                              {service.label}
                              {' — '}
                              {formatServiceTime(service.time)}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )}
          </div>
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
