'use client'

import { useEffect } from 'react'

type WakeLockSentinelLike = { release: () => Promise<void> }
type WakeLockNavigator = { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }

/**
 * Empêche l'écran du téléphone de s'éteindre pendant la lecture au pupitre.
 * Sans effet si le navigateur ne le permet pas.
 */
export function KeepAwake() {
  useEffect(() => {
    let lock: WakeLockSentinelLike | null = null
    let cancelled = false

    async function request() {
      try {
        const { wakeLock } = navigator as unknown as WakeLockNavigator
        if (!wakeLock || document.visibilityState !== 'visible') return
        const sentinel = await wakeLock.request('screen')
        if (cancelled) {
          void sentinel.release()
          return
        }
        lock = sentinel
      } catch {
        // Refusé ou non supporté : on lit simplement sans.
      }
    }

    void request()

    // Le verrou tombe quand l'onglet passe en arrière-plan : on le redemande au retour.
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') void request()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void lock?.release()
    }
  }, [])

  return null
}
