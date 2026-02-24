'use client'

import { ResourceActions } from '@/components/features/resource-actions'

interface PlanActionsProps {
  planId: number
  planLabel: string
  canDelete: boolean
}

export function PlanActions({ planId, planLabel, canDelete }: PlanActionsProps) {
  return (
    <ResourceActions
      resourceId={planId}
      resourceName={planLabel}
      collection="service-plans"
      basePath="/dashboard/planning"
      labels={{
        deleteTitle: 'Supprimer ce culte ?',
        deleteDescription:
          'Le culte « {name} » sera définitivement supprimé. Cette action est irréversible.',
        deleteError: 'Impossible de supprimer ce culte',
        deleteSuccess: 'Culte supprimé',
      }}
      canDelete={canDelete}
    />
  )
}
