import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, BookOpen, Calendar, Mic, BookMarked } from 'lucide-react'
import type { Metadata } from 'next'
import type { Payload } from 'payload'

import { resolveTenant } from '@/lib/tenant'
import { formatDate } from '@/lib/format'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { TenantTheme } from '@/components/tenant-theme'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { Button } from '@/components/ui/button'

export const revalidate = 60

function getThumb(image: unknown): string | null {
  if (typeof image === 'object' && image !== null) {
    const img = image as Record<string, unknown>
    const sizes = img.sizes as Record<string, { url?: string }> | undefined
    if (sizes?.card?.url) return sizes.card.url
    if (typeof img.url === 'string') return img.url
  }
  return null
}

function getAudioUrl(audio: unknown): string | null {
  if (typeof audio === 'object' && audio !== null) {
    const a = audio as Record<string, unknown>
    if (typeof a.url === 'string') return a.url
  }
  return null
}

function getPreacherName(preacher: unknown): string | null {
  if (!preacher || typeof preacher !== 'object') return null
  const p = preacher as { firstName?: string; lastName?: string }
  return [p.firstName, p.lastName].filter(Boolean).join(' ') || null
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`
    }
  } catch { /* not a valid URL */ }
  return null
}

const getSermon = cache(async (payload: Payload, id: number | string) => {
  try {
    return await payload.findByID({
      collection: 'sermons',
      id,
      depth: 1,
      overrideAccess: true,
    })
  } catch {
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
  const sermon = await getSermon(payload, id)
  if (!sermon) return {}
  const preacher = getPreacherName(sermon.preacher)
  const description = `${sermon.title}${preacher ? ` — ${preacher}` : ''} — ${formatDate(sermon.date)}`
  const ogImage = getThumb(sermon.image) || undefined
  return {
    title: `${sermon.title} | ${tenant.name}`,
    description,
    openGraph: {
      title: `${sermon.title} | ${tenant.name}`,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  }
}

export default async function SermonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { payload, user, tenant, branding, profile, logoUrl } = await resolveTenant()

  if (!tenant) notFound()

  const sermon = await getSermon(payload, id)
  if (!sermon) notFound()

  const sermonChurchId = typeof sermon.church === 'object' ? sermon.church?.id : sermon.church
  if (String(sermonChurchId) !== String(tenant.id)) notFound()

  if (sermon.visibility === 'internal' && !user) notFound()

  const heroImage = getThumb(sermon.image)
  const audioUrl = getAudioUrl(sermon.audioFile)
  const preacherName = getPreacherName(sermon.preacher)
  const youtubeEmbed = sermon.videoUrl ? getYouTubeEmbedUrl(sermon.videoUrl) : null

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
              alt={sermon.title}
              width={1920}
              height={600}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 sm:h-64 bg-linear-to-br from-raisin/80 to-violet/60 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-cream/30" />
          </div>
        )}
      </div>

      {/* ── Contenu ── */}
      <section className="bg-cream flex-1 px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <Button asChild variant="raisin" size="sm" className="mb-6">
              <Link href="/sermons">
                <ArrowLeft className="h-4 w-4" />
                Toutes les prédications
              </Link>
            </Button>
          </ScrollReveal>

          <ScrollReveal>
            <h1 className="font-heading font-black text-3xl sm:text-4xl uppercase tracking-wide leading-snug text-raisin">
              {sermon.title}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-sunglow/15 px-4 py-1.5 text-sm font-medium text-raisin">
                <Calendar className="h-4 w-4 text-sunglow" />
                <span className="capitalize">{formatDate(sermon.date)}</span>
              </span>
              {preacherName && (
                <span className="inline-flex items-center gap-2 rounded-full bg-violet/15 px-4 py-1.5 text-sm font-medium text-raisin">
                  <Mic className="h-4 w-4 text-violet" />
                  {preacherName}
                </span>
              )}
              {sermon.scripture && (
                <span className="inline-flex items-center gap-2 rounded-full bg-raisin/8 px-4 py-1.5 text-sm font-medium text-raisin">
                  <BookMarked className="h-4 w-4 text-raisin/50" />
                  {sermon.scripture}
                </span>
              )}
              {sermon.series && (
                <span className="inline-flex items-center gap-2 rounded-full bg-violet/10 px-4 py-1.5 text-xs font-medium text-raisin/70">
                  {sermon.series}
                </span>
              )}
            </div>
          </ScrollReveal>

          {/* ── Player vidéo YouTube ── */}
          {youtubeEmbed && (
            <ScrollReveal delay={0.15}>
              <div className="mt-8 rounded-xl overflow-hidden border border-raisin/8 shadow-sm">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={youtubeEmbed}
                    title={sermon.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* ── Lien vidéo non-YouTube ── */}
          {sermon.videoUrl && !youtubeEmbed && (
            <ScrollReveal delay={0.15}>
              <div className="mt-8">
                <a
                  href={sermon.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-raisin underline underline-offset-4 hover:text-sunglow transition-colors"
                >
                  Regarder la vidéo
                </a>
              </div>
            </ScrollReveal>
          )}

          {/* ── Player audio ── */}
          {audioUrl && (
            <ScrollReveal delay={0.2}>
              <div className="mt-8">
                <p className="text-sm font-medium text-raisin/60 mb-2">Écouter</p>
                <audio controls className="w-full rounded-lg" preload="metadata">
                  <source src={audioUrl} />
                  Votre navigateur ne supporte pas la lecture audio.
                </audio>
              </div>
            </ScrollReveal>
          )}

          {/* ── Description ── */}
          {sermon.description && (
            <ScrollReveal delay={0.25}>
              <div className="mt-8 text-raisin/70 leading-relaxed whitespace-pre-wrap">
                {sermon.description}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      <PublicFooter
        churchName={tenant.name}
        logoUrl={logoUrl}
        social={profile?.social}
      />
    </div>
  )
}
