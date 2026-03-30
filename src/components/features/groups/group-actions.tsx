'use client'

import { ResourceActions } from '@/components/features/resource-actions'

interface GroupActionsProps {
  groupId: number
  groupName: string
  canDelete: boolean
}

export function GroupActions({ groupId, groupName, canDelete }: GroupActionsProps) {
  return (
    <div onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
    <ResourceActions
      resourceId={groupId}
      resourceName={groupName}
      collection="groups"
      basePath="/dashboard/groups"
      labels={{
        deleteTitle: 'Supprimer le groupe ?',
        deleteDescription: 'Le groupe « {name} » sera supprimé. Les membres ne seront pas affectés.',
        deleteError: 'Erreur lors de la suppression du groupe',
        deleteSuccess: 'Groupe supprimé',
      }}
      canDelete={canDelete}
    />
    </div>
  )
}
