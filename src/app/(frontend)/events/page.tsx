import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CalendarX } from 'lucide-react'
import type { Metadata } from 'next'

import { resolveTenant } from '@/lib/tenant'
import { formatDate, formatTime } from '@/lib/format'
import { PublicHeader } from '@/components/layout/public-header'
import { TenantTheme } from '@/components/tenant-theme'
import { Card, CardContent } from '@/components/ui/card'

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
  const { payload, user, tenant, branding } = await resolveTenant()

  if (!tenant) notFound()

  const { docs: events } = await payload.find({
    collection: 'events',
    where: {
      church: { equals: tenant.id },
      visibility: { equals: 'public' },
    },
    sort: 'date',
    limit: 100,
    overrideAccess: true,
  })

  const now = new Date().toISOString().split('T')[0]
  const upcoming = events.filter((e) => e.date >= now)
  const past = events.filter((e) => e.date < now).reverse()

  const logoUrl = typeof branding?.logo === 'object' && branding.logo?.url ? branding.logo.url : null

  return (
    <div className="min-h-screen flex flex-col">
      <TenantTheme colors={branding?.colors || {}} />
      <PublicHeader churchName={tenant.name} logoUrl={logoUrl} isLoggedIn={!!user} />

      <div className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-8">Événements</h1>

          {/* Upcoming */}
          {upcoming.length > 0 ? (
            <div className="grid gap-4">
              {upcoming.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="font-heading font-bold">{event.title}</p>
                        {event.location && (
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(event.date)} à {formatTime(event.time)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CalendarX className="h-12 w-12 mb-4 opacity-40" />
              <p>Aucun événement à venir pour le moment.</p>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-heading font-bold mb-4 text-muted-foreground">
                Événements passés
              </h2>
              <div className="grid gap-3 opacity-60">
                {past.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="hover:shadow-sm transition-all cursor-pointer">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(event.date)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} {tenant.name}
      </footer>
    </div>
  )
}
