'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { AcquirePlanLockResult, PlanLockOwner } from '@/lib/plan-lock'

/** Prolongation du verrou tant que la page est ouverte et utilisée. */
const HEARTBEAT_MS = 60_000
/** Sans interaction pendant ce délai, on cesse de prolonger : le verrou expire de lui-même. */
const IDLE_MS = 10 * 60_000
/** Fréquence à laquelle un lecteur regarde si le culte s'est libéré. */
const WATCH_MS = 20_000
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'input'] as const

export type PlanLockStatus =
  /** Création : rien à verrouiller. */
  | 'unlocked'
  | 'mine'
  /** Tenu par quelqu'un d'autre à l'ouverture. */
  | 'locked'
  /** Repris par quelqu'un d'autre, ou culte modifié, pendant une absence. */
  | 'lost'
  /** L'autre a terminé : recharger pour repartir de la dernière version. */
  | 'freed'

/**
 * Verrou d'édition d'un culte : le premier qui l'ouvre le modifie, les autres
 * le voient en lecture seule. Sans `planId` (création), ne fait rien.
 */
export function usePlanLock(
  planId: number | undefined,
  initialLockedBy: PlanLockOwner | null,
  planUpdatedAt?: string,
) {
  const url = planId == null ? null : `/api/service-plans/${planId}/lock`
  const [status, setStatus] = useState<PlanLockStatus>(
    !url ? 'unlocked' : initialLockedBy ? 'locked' : 'mine',
  )
  const [lockedBy, setLockedBy] = useState<PlanLockOwner | null>(initialLockedBy)

  const statusRef = useRef(status)
  const lastActivityRef = useRef(0)
  const idleRef = useRef(false)
  const savedRef = useRef(false)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  /** Pose ou prolonge le verrou. Après une absence, vérifie aussi que le culte n'a pas changé. */
  const acquire = useCallback(
    async (onRefused: 'locked' | 'lost', afterIdle = false) => {
      if (!url || savedRef.current) return
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(afterIdle ? { expectUpdatedAt: planUpdatedAt } : {}),
      }).catch(() => null)
      // Réseau ou serveur indisponible : le prochain battement réessaiera.
      if (!res?.ok) return

      const result = (await res.json()) as AcquirePlanLockResult
      if (result.ok) return
      setLockedBy('lockedBy' in result ? result.lockedBy : null)
      setStatus(onRefused)
    },
    [url, planUpdatedAt],
  )

  // Prendre le verrou à l'ouverture, puis le prolonger tant que la page est utilisée.
  useEffect(() => {
    if (status !== 'mine') return
    lastActivityRef.current = Date.now()
    void acquire('locked')

    const onActivity = () => {
      lastActivityRef.current = Date.now()
      if (idleRef.current) {
        idleRef.current = false
        void acquire('lost', true)
      }
    }
    const heartbeat = setInterval(() => {
      if (Date.now() - lastActivityRef.current > IDLE_MS) {
        idleRef.current = true
        return
      }
      void acquire('lost')
    }, HEARTBEAT_MS)

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, onActivity))
    return () => {
      clearInterval(heartbeat)
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity))
    }
  }, [status, acquire])

  // En lecture seule : prévenir dès que le culte se libère.
  useEffect(() => {
    if (status !== 'locked' || !url) return
    const watch = setInterval(async () => {
      const res = await fetch(url).catch(() => null)
      if (!res?.ok) return
      const { lockedBy: owner } = (await res.json()) as { lockedBy: PlanLockOwner | null }
      if (owner) setLockedBy(owner)
      else setStatus('freed')
    }, WATCH_MS)
    return () => clearInterval(watch)
  }, [status, url])

  // Libérer le verrou en quittant la page (navigation ou fermeture de l'onglet).
  useEffect(() => {
    if (!url) return
    const release = () => {
      if (statusRef.current !== 'mine') return
      void fetch(url, { method: 'DELETE', keepalive: true }).catch(() => {})
    }
    window.addEventListener('pagehide', release)
    return () => {
      window.removeEventListener('pagehide', release)
      release()
    }
  }, [url])

  /** Après un enregistrement réussi : Payload a déjà retiré le verrou, ne pas le reprendre. */
  const markSaved = useCallback(() => {
    savedRef.current = true
  }, [])

  /** Enregistrement refusé (423) : découvrir qui tient le verrou. */
  const recheck = useCallback(() => acquire('lost'), [acquire])

  return {
    status,
    lockedBy,
    readOnly: status === 'locked' || status === 'lost' || status === 'freed',
    markSaved,
    recheck,
  }
}
