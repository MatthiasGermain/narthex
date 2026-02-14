import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import config from '@/payload.config'
import { getTenantSlug, getTenantBySlug } from '@/lib/tenant'
import { EventForm } from '@/components/features/events/event-form'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const eventId = Number(id)
  if (Number.isNaN(eventId)) notFound()

  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) return null

  const tenantSlug = getTenantSlug(headers)
  const tenant = tenantSlug ? await getTenantBySlug(payload, tenantSlug) : null
  if (!tenant) notFound()

  const event = await payload.findByID({
    collection: 'events',
    id: eventId,
    overrideAccess: false,
    user,
  }).catch(() => null)

  if (!event) notFound()

  // Vérifier que l'event appartient au tenant courant
  const eventChurchId = typeof event.church === 'object' ? event.church?.id : event.church
  if (String(eventChurchId) !== String(tenant.id)) notFound()

  // Extraire la date au format YYYY-MM-DD depuis l'ISO string de Payload
  const dateValue = event.date ? new Date(event.date).toISOString().split('T')[0] : ''

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au calendrier
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Modifier l&apos;événement</h1>
      </div>

      <EventForm
        mode="edit"
        defaultValues={{
          id: event.id,
          title: event.title,
          date: dateValue,
          time: event.time,
          location: event.location ?? '',
          description: event.description ?? '',
          visibility: event.visibility as 'public' | 'internal',
        }}
      />
    </div>
  )
}
