'use client'

import { ResourceActions } from '@/components/features/resource-actions'

interface RoomActionsProps {
  roomId: number
  roomName: string
  canDelete: boolean
}

export function RoomActions({ roomId, roomName, canDelete }: RoomActionsProps) {
  return (
    <ResourceActions
      resourceId={roomId}
      resourceName={roomName}
      collection="rooms"
      basePath="/dashboard/rooms"
      labels={{
        deleteTitle: 'Supprimer la salle ?',
        deleteDescription: 'La salle \u00ab\u00a0{name}\u00a0\u00bb sera d\u00e9finitivement supprim\u00e9e. Cette action est irr\u00e9versible.',
        deleteError: 'Impossible de supprimer cette salle',
        deleteSuccess: 'Salle supprim\u00e9e',
      }}
      canDelete={canDelete}
    />
  )
}
