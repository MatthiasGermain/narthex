import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'

import config from '@/payload.config'
import { getTenantSlug, getTenantBySlug } from '@/lib/tenant'
import { formatDate, formatTime } from '@/lib/format'
import { PublicHeader } from '@/components/layout/public-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const tenantSlug = getTenantSlug(headers)

  // Pas de tenant → page Narthex générique
  if (!tenantSlug) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <img src="/brand/logo_noir_sans_fond.svg" alt="Narthex" className="h-12" />
        <h1 className="text-2xl font-heading font-bold">Narthex</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Plateforme pour les églises. Accédez au site de votre église via son domaine.
        </p>
      </div>
    )
  }

  const tenant = await getTenantBySlug(payload, tenantSlug)
  if (!tenant) notFound()

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
    overrideAccess: true,
  })

  const logoUrl = typeof tenant.logo === 'object' && tenant.logo?.url ? tenant.logo.url : null

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader churchName={tenant.name} logoUrl={logoUrl} isLoggedIn={!!user} />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold max-w-lg">
          Bienvenue à {tenant.name}
        </h1>
        <p className="mt-3 text-muted-foreground max-w-md">
          Découvrez nos événements et rejoignez notre communauté.
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link href="/events">
            <Calendar className="h-4 w-4 mr-2" />
            Voir les événements
          </Link>
        </Button>
      </section>

      {/* Prochains événements */}
      {upcomingEvents.length > 0 && (
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-heading font-bold mb-6">Prochains événements</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
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
              ))}
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
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {tenant.name}
      </footer>
    </div>
  )
}
