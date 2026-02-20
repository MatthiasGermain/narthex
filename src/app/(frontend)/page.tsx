import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  ArrowRight,
  Clock,
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Youtube,
  Info,
} from 'lucide-react'
import type { Metadata } from 'next'

import { resolveTenant } from '@/lib/tenant'
import { formatDate, formatTime, DAY_LABELS, formatServiceTime } from '@/lib/format'
import { PublicHeader } from '@/components/layout/public-header'
import { TenantTheme } from '@/components/tenant-theme'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const { tenant, profile } = await resolveTenant()
  if (!tenant) {
    return {
      title: 'Narthex — Plateforme pour les églises',
      description: 'Narthex remplace WordPress pour les églises francophones.',
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
  const { payload, user, tenant, branding, profile } = await resolveTenant()

  // Pas de tenant → page Narthex générique
  if (!tenant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <Image src="/brand/logo_noir_sans_fond.svg" alt="Narthex" width={180} height={48} className="h-12 w-auto" />
        <h1 className="text-2xl font-heading font-bold">Narthex</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Plateforme pour les églises. Accédez au site de votre église via son domaine.
        </p>
      </div>
    )
  }

  // Fetch 3 prochains événements publics
  const { docs: upcomingEvents } = await payload.find({
    collection: 'events',
    where: {
      church: { equals: tenant.id },
      visibility: { equals: 'public' },
      date: { greater_than_equal: new Date().toISOString().split('T')[0] },
    },
    sort: 'date',
    limit: 3,
    depth: 1,
    overrideAccess: true,
  })

  const logoUrl = typeof branding?.logo === 'object' && branding.logo?.url ? branding.logo.url : null

  const hasServices = profile?.services && profile.services.length > 0
  const hasAddress = profile?.address?.street || profile?.address?.city
  const hasContact = profile?.contact?.email || profile?.contact?.phone
  const hasInfo = hasAddress || hasContact
  const hasSocial = profile?.social?.facebook || profile?.social?.instagram || profile?.social?.youtube

  const heroDescription = profile?.description
    ? profile.description.length > 200
      ? profile.description.slice(0, 200).replace(/\s+\S*$/, '') + '…'
      : profile.description
    : null

  return (
    <div className="min-h-screen flex flex-col">
      <TenantTheme colors={branding?.colors || {}} />
      <PublicHeader churchName={tenant.name} logoUrl={logoUrl} isLoggedIn={!!user} />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold max-w-lg">
          Bienvenue à {tenant.name}
        </h1>
        <p className="mt-3 text-muted-foreground max-w-md">
          {heroDescription || 'Découvrez nos événements et rejoignez notre communauté.'}
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/events">
              <Calendar className="h-4 w-4 mr-2" />
              Voir les événements
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/about">
              <Info className="h-4 w-4 mr-2" />
              En savoir plus
            </Link>
          </Button>
        </div>
      </section>

      {/* Horaires des cultes */}
      {hasServices && (
        <section className="border-y bg-muted/30 px-4 py-6">
          <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary" />
              <span>Nos cultes</span>
            </div>
            {profile!.services!.map((service) => (
              <div key={service.id || service.label} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{DAY_LABELS[service.day] || service.day}</span>
                {' — '}
                {service.label}
                {' — '}
                {formatServiceTime(service.time)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Prochains événements */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl font-heading font-bold mb-6">Prochains événements</h2>
          {upcomingEvents.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => {
                  const thumb = typeof event.image === 'object' && event.image?.sizes?.thumbnail?.url
                    ? event.image.sizes.thumbnail.url
                    : typeof event.image === 'object' && event.image?.url
                      ? event.image.url
                      : null
                  return (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full overflow-hidden">
                        {thumb && (
                          <Image
                            src={thumb}
                            alt={typeof event.image === 'object' && event.image?.alt ? event.image.alt : event.title}
                            width={400}
                            height={300}
                            className="w-full h-36 object-cover"
                          />
                        )}
                        <CardContent className="p-5">
                          <p className="font-heading font-bold">{event.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(event.date)} à {formatTime(event.time)}
                          </p>
                          {event.location && (
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                >
                  Voir tous les événements
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Aucun événement à venir pour le moment.
            </p>
          )}
        </div>
      </section>

      {/* Info rapide */}
      {hasInfo && (
        <section className="px-4 pb-12">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hasAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Adresse</p>
                    <p className="text-muted-foreground">
                      {profile!.address!.street && <>{profile!.address!.street}<br /></>}
                      {profile!.address!.postalCode} {profile!.address!.city}
                    </p>
                  </div>
                </div>
              )}
              {profile?.contact?.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Email</p>
                    <Link
                      href={`mailto:${profile.contact.email}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {profile.contact.email}
                    </Link>
                  </div>
                </div>
              )}
              {profile?.contact?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Téléphone</p>
                    <Link
                      href={`tel:${profile.contact.phone.replace(/\s/g, '')}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {profile.contact.phone}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/about"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
              >
                Toutes les infos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t px-4 py-6">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-3">
          {hasSocial && (
            <div className="flex gap-4">
              {profile!.social!.facebook && (
                <Link href={profile!.social!.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
              )}
              {profile!.social!.instagram && (
                <Link href={profile!.social!.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {profile!.social!.youtube && (
                <Link href={profile!.social!.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Youtube className="h-5 w-5" />
                </Link>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {tenant.name}
          </p>
        </div>
      </footer>
    </div>
  )
}
