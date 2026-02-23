import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { EventForm } from '@/components/features/events/event-form'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const eventId = Number(id)
  if (Number.isNaN(eventId)) notFound()

  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) notFound()

  const [event, { docs: roomDocs }] = await Promise.all([
    payload.findByID({
      collection: 'events',
      id: eventId,
      depth: 1,
      overrideAccess: false,
      user,
    }).catch(() => null),
    payload.find({
      collection: 'rooms',
      where: { church: { equals: tenant.id }, isActive: { equals: true } },
      sort: 'name',
      limit: 100,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  if (!event) notFound()

  // Vérifier que l'event appartient au tenant courant
  const eventChurchId = typeof event.church === 'object' ? event.church?.id : event.church
  if (String(eventChurchId) !== String(tenant.id)) notFound()

  // Extraire la date au format YYYY-MM-DD depuis l'ISO string de Payload
  const dateValue = event.date ? new Date(event.date).toISOString().split('T')[0] : ''

  const rooms = roomDocs.map((r) => ({ id: r.id, name: r.name }))

  // Extraire l'ID de la salle (peut être un objet ou un number selon le depth)
  const eventRoomId = typeof event.room === 'object' ? (event.room as { id: number } | null)?.id : event.room as number | null | undefined

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
        churchId={tenant.id}
        rooms={rooms}
        defaultValues={{
          id: event.id,
          title: event.title,
          date: dateValue,
          time: event.time,
          location: event.location ?? '',
          description: event.description ?? '',
          visibility: event.visibility as 'public' | 'internal',
          room: eventRoomId ?? null,
          image: event.image as number | { id: number; url?: string; sizes?: { thumbnail?: { url?: string } }; alt?: string } | null,
        }}
      />
    </div>
  )
}
