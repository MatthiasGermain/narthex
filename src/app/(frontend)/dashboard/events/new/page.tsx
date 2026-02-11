import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import config from '@/payload.config'
import { EventForm } from '@/components/features/events/event-form'

export default async function NewEventPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) return null

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

      <EventForm mode="create" />
    </div>
  )
}
