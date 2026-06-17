import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { EventForm } from '@/components/features/events/event-form'

interface Props {
  searchParams: Promise<{ date?: string }>
}

export default async function NewEventPage({ searchParams }: Props) {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const { docs: roomDocs } = await payload.find({
    collection: 'rooms',
    where: { church: { equals: tenant.id }, isActive: { equals: true } },
    sort: 'name',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  const rooms = roomDocs.map((r) => ({ id: r.id, name: r.name }))

  // Date pré-remplie depuis le calendrier (format YYYY-MM-DD)
  const { date } = await searchParams
  const defaultDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined

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
        <h1 className="text-2xl sm:text-3xl font-bold">Nouvel événement</h1>
      </div>

      <EventForm
        mode="create"
        churchId={tenant.id}
        rooms={rooms}
        defaultValues={defaultDate ? { date: defaultDate } : undefined}
      />
    </div>
  )
}
