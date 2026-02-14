import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, MapPin, Mail, Phone, Globe, Facebook, Instagram, Youtube } from 'lucide-react'
import type { Metadata } from 'next'

import { resolveTenant } from '@/lib/tenant'
import { PublicHeader } from '@/components/layout/public-header'
import { TenantTheme } from '@/components/tenant-theme'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const revalidate = 60

const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
}

function formatServiceTime(time: string): string {
  const [h, m] = time.split(':')
  return m === '00' ? `${parseInt(h)}h` : `${parseInt(h)}h${m}`
}

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
  const { user, tenant, branding, profile } = await resolveTenant()

  if (!tenant) notFound()

  const logoUrl = typeof branding?.logo === 'object' && branding.logo?.url ? branding.logo.url : null

  const hasAddress = profile?.address?.street || profile?.address?.city
  const hasContact = profile?.contact?.email || profile?.contact?.phone || profile?.contact?.website
  const hasSocial = profile?.social?.facebook || profile?.social?.instagram || profile?.social?.youtube
  const hasServices = profile?.services && profile.services.length > 0

  return (
    <div className="min-h-screen flex flex-col">
      <TenantTheme colors={branding?.colors || {}} />
      <PublicHeader churchName={tenant.name} logoUrl={logoUrl} isLoggedIn={!!user} />

      <div className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-8">À propos</h1>

          {/* Description */}
          {profile?.description && (
            <section className="mb-10">
              <h2 className="text-lg font-heading font-bold mb-3">Qui sommes-nous ?</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {profile.description}
              </p>
            </section>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Horaires des cultes */}
            {hasServices && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horaires des cultes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profile!.services!.map((service) => (
                    <div key={service.id || service.label} className="flex justify-between text-sm">
                      <span>
                        <span className="font-medium">{service.label}</span>
                        <span className="text-muted-foreground ml-1">— {DAY_LABELS[service.day] || service.day}</span>
                      </span>
                      <span className="text-muted-foreground">{formatServiceTime(service.time)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Adresse */}
            {hasAddress && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  {profile!.address!.street && <p>{profile!.address!.street}</p>}
                  {(profile!.address!.postalCode || profile!.address!.city) && (
                    <p>
                      {profile!.address!.postalCode} {profile!.address!.city}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            {hasContact && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {profile!.contact!.email && (
                    <Link
                      href={`mailto:${profile!.contact!.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {profile!.contact!.email}
                    </Link>
                  )}
                  {profile!.contact!.phone && (
                    <Link
                      href={`tel:${profile!.contact!.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {profile!.contact!.phone}
                    </Link>
                  )}
                  {profile!.contact!.website && (
                    <Link
                      href={profile!.contact!.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Site web
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Réseaux sociaux */}
            {hasSocial && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Réseaux sociaux</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {profile!.social!.facebook && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={profile!.social!.facebook} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Link>
                    </Button>
                  )}
                  {profile!.social!.instagram && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={profile!.social!.instagram} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </Link>
                    </Button>
                  )}
                  {profile!.social!.youtube && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={profile!.social!.youtube} target="_blank" rel="noopener noreferrer">
                        <Youtube className="h-4 w-4 mr-2" />
                        YouTube
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Fallback si aucun profil */}
          {!profile?.description && !hasServices && !hasAddress && !hasContact && !hasSocial && (
            <p className="text-muted-foreground text-center py-16">
              Les informations de cette église seront bientôt disponibles.
            </p>
          )}
        </div>
      </div>

      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {tenant.name}
      </footer>
    </div>
  )
}
