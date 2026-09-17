'use client'

import { Lock, RefreshCw } from 'lucide-react'

import type { PlanLockOwner } from '@/lib/plan-lock'
import { Button } from '@/components/ui/button'
import type { PlanLockStatus } from './use-plan-lock'

interface PlanLockBannerProps {
  status: PlanLockStatus
  lockedBy: PlanLockOwner | null
}

function messageOf(status: PlanLockStatus, lockedBy: PlanLockOwner | null): string | null {
  switch (status) {
    case 'locked':
      return `${lockedBy?.name ?? 'Quelqu’un'} modifie ce culte depuis ${lockedBy?.since ?? 'un moment'}. Lecture seule : cette page vous préviendra dès qu’il sera libre.`
    case 'freed':
      return 'Le culte est de nouveau libre. Rechargez pour voir la dernière version avant de le modifier.'
    case 'lost':
      return lockedBy
        ? `${lockedBy.name} a pris la main sur ce culte pendant votre absence. Vos changements non enregistrés ne peuvent plus être enregistrés.`
        : 'Ce culte a été modifié pendant votre absence. Vos changements non enregistrés ne peuvent plus être enregistrés.'
    default:
      return null
  }
}

export function PlanLockBanner({ status, lockedBy }: PlanLockBannerProps) {
  const message = messageOf(status, lockedBy)
  if (!message) return null

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sunglow/30 bg-sunglow/15 px-4 py-3 text-raisin"
    >
      <p className="flex gap-3 text-sm">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" />
        {message}
      </p>
      {status !== 'locked' && (
        <Button type="button" variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Recharger
        </Button>
      )}
    </div>
  )
}
