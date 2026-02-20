import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { EventForm } from '@/components/features/events/event-form'

export default async function NewEventPage() {
  const { user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

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

      <EventForm mode="create" churchId={tenant.id} />
    </div>
  )
}
