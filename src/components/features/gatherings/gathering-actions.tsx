'use client'

import { ResourceActions } from '@/components/features/resource-actions'

interface GatheringActionsProps {
  gatheringId: number
  gatheringTitle: string
  canDelete: boolean
}

export function GatheringActions({
  gatheringId,
  gatheringTitle,
  canDelete,
}: GatheringActionsProps) {
  return (
    <div onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
      <ResourceActions
        resourceId={gatheringId}
        resourceName={gatheringTitle}
        collection="gatherings"
        basePath="/dashboard/gatherings"
        labels={{
          deleteTitle: 'Supprimer ce rassemblement ?',
          deleteDescription:
            'Le rassemblement « {name} » sera supprimé. Ses événements et ses cultes sont conservés — ils redeviennent simplement indépendants.',
          deleteError: 'Erreur lors de la suppression du rassemblement',
          deleteSuccess: 'Rassemblement supprimé',
        }}
        canDelete={canDelete}
      />
    </div>
  )
}
