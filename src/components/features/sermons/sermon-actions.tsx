'use client'

import { ResourceActions } from '@/components/features/resource-actions'

interface SermonActionsProps {
  sermonId: number
  sermonTitle: string
  canDelete: boolean
}

export function SermonActions({ sermonId, sermonTitle, canDelete }: SermonActionsProps) {
  return (
    <ResourceActions
      resourceId={sermonId}
      resourceName={sermonTitle}
      collection="sermons"
      basePath="/dashboard/sermons"
      labels={{
        deleteTitle: 'Supprimer la prédication ?',
        deleteDescription: 'La prédication «\u00a0{name}\u00a0» sera définitivement supprimée. Cette action est irréversible.',
        deleteError: 'Impossible de supprimer cette prédication',
        deleteSuccess: 'Prédication supprimée',
      }}
      canDelete={canDelete}
    />
  )
}
