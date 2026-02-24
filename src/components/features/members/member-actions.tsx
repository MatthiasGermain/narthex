'use client'

import { ResourceActions } from '@/components/features/resource-actions'

interface MemberActionsProps {
  memberId: number
  memberName: string
  canDelete: boolean
}

export function MemberActions({ memberId, memberName, canDelete }: MemberActionsProps) {
  return (
    <ResourceActions
      resourceId={memberId}
      resourceName={memberName}
      collection="members"
      basePath="/dashboard/members"
      labels={{
        deleteTitle: 'Supprimer le membre ?',
        deleteDescription: 'Le membre \u00ab\u00a0{name}\u00a0\u00bb sera d\u00e9finitivement supprim\u00e9 de l\u2019annuaire. Cette action est irr\u00e9versible.',
        deleteError: 'Impossible de supprimer ce membre',
        deleteSuccess: 'Membre supprim\u00e9',
      }}
      canDelete={canDelete}
    />
  )
}
