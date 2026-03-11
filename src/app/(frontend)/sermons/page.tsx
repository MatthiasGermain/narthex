import { notFound } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import type { Metadata } from 'next'

import { resolveTenant } from '@/lib/tenant'
import { formatDate } from '@/lib/format'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { PublicPageHero } from '@/components/layout/public-page-hero'
import { TenantTheme } from '@/components/tenant-theme'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { AnimatedUnderline } from '@/components/landing/animated-underline'
import { SermonCard } from '@/components/public/sermon-card'
import Link from 'next/link'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const { tenant } = await resolveTenant()
  if (!tenant) return {}
  return {
    title: `Prédications | ${tenant.name}`,
    description: `Écoutez et regardez les prédications de ${tenant.name}.`,
    openGraph: {
      title: `Prédications | ${tenant.name}`,
      description: `Écoutez et regardez les prédications de ${tenant.name}.`,
    },
  }
}

export default async function PublicSermonsPage() {
  const { payload, user, tenant, branding, profile, logoUrl } = await resolveTenant()

  if (!tenant) notFound()

  const { docs: sermons } = await payload.find({
    collection: 'sermons',
    where: {
      church: { equals: tenant.id },
      visibility: { equals: 'public' },
    },
    sort: '-date',
    limit: 100,
    depth: 1,
    overrideAccess: true,
  })

  const recent = sermons.slice(0, 9)
  const older = sermons.slice(9)

  return (
    <div className="min-h-screen flex flex-col">
      <TenantTheme colors={branding?.colors || {}} />
      <PublicHeader churchName={tenant.name} logoUrl={logoUrl} isLoggedIn={!!user} />

      <PublicPageHero
        title="Prédications"
        highlight="Prédications"
        subtitle="Écoutez ou regardez nos dernières prédications."
        className="bg-cream"
      />

      {/* ── Dernières prédications ── */}
      <section className="bg-cream/50 px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-raisin mb-8 text-center">
              Les <AnimatedUnderline>dernières</AnimatedUnderline>
            </h2>
          </ScrollReveal>
          {recent.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((sermon, i) => (
                <ScrollReveal key={sermon.id} delay={i * 0.1}>
                  <SermonCard sermon={sermon} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal>
              <div className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-12 w-12 mb-4 text-raisin/20" />
                <p className="text-raisin/50">Aucune prédication disponible pour le moment.</p>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── Prédications plus anciennes ── */}
      {older.length > 0 && (
        <section className="bg-violet/10 px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <ScrollReveal>
              <h2 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-wide text-raisin/60 mb-8 text-center">
                Archives
              </h2>
            </ScrollReveal>
            <div className="grid gap-3 max-w-3xl mx-auto">
              {older.map((sermon, i) => (
                <ScrollReveal key={sermon.id} delay={i * 0.05}>
                  <Link href={`/sermons/${sermon.id}`} className="group block">
                    <div className="rounded-lg bg-cream/60 border border-raisin/6 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 transition-all duration-200 group-hover:bg-cream/80 group-hover:shadow-sm">
                      <div className="min-w-0">
                        <p className="font-heading font-medium text-sm text-raisin/70">{sermon.title}</p>
                        {sermon.series && (
                          <p className="text-xs text-raisin/40 mt-0.5">{sermon.series}</p>
                        )}
                      </div>
                      <p className="text-xs text-raisin/40 whitespace-nowrap shrink-0">
                        {formatDate(sermon.date)}
                      </p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <PublicFooter
        churchName={tenant.name}
        logoUrl={logoUrl}
        social={profile?.social}
      />
    </div>
  )
}
