'use client'

import { ResourceActions } from '@/components/features/resource-actions'

interface EventActionsProps {
  eventId: number
  eventTitle: string
  canDelete: boolean
}

export function EventActions({ eventId, eventTitle, canDelete }: EventActionsProps) {
  return (
    <ResourceActions
      resourceId={eventId}
      resourceName={eventTitle}
      collection="events"
      basePath="/dashboard/events"
      labels={{
        deleteTitle: "Supprimer l\u2019\u00e9v\u00e9nement ?",
        deleteDescription: "L\u2019\u00e9v\u00e9nement \u00ab\u00a0{name}\u00a0\u00bb sera d\u00e9finitivement supprim\u00e9. Cette action est irr\u00e9versible.",
        deleteError: "Impossible de supprimer cet \u00e9v\u00e9nement",
        deleteSuccess: "\u00c9v\u00e9nement supprim\u00e9",
      }}
      canDelete={canDelete}
    />
  )
}
