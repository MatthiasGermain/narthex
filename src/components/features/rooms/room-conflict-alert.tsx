'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

import { formatTime } from '@/lib/format'
import type { BookingKind, RoomConflict } from '@/lib/room-conflicts'
import { checkRoomConflicts } from '@/app/(frontend)/dashboard/rooms/conflict-actions'

const TIME = /^\d{2}:\d{2}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

interface RoomConflictAlertProps {
  kind: BookingKind
  /** Identifiant de salle tel que tenu par le formulaire (chaîne vide = aucune). */
  roomId: string
  /** YYYY-MM-DD */
  date: string
  /** HH:mm */
  time: string
  endTime: string
  /** L'élément en cours d'édition. */
  excludeId?: number
}

/**
 * Avertit pendant la saisie qu'une salle est déjà occupée sur le créneau.
 * N'empêche jamais d'enregistrer : partager une salle peut être voulu.
 */
export function RoomConflictAlert({
  kind,
  roomId,
  date,
  time,
  endTime,
  excludeId,
}: RoomConflictAlertProps) {
  const [conflicts, setConflicts] = useState<RoomConflict[]>([])
  const latestRequest = useRef(0)

  const ready = Boolean(roomId) && DATE.test(date) && TIME.test(time)

  useEffect(() => {
    const request = ++latestRequest.current
    if (!ready) {
      setConflicts([])
      return
    }

    // On attend la fin de la frappe avant d'interroger le serveur.
    const timer = setTimeout(async () => {
      const res = await checkRoomConflicts({
        kind,
        roomId: Number(roomId),
        date,
        time,
        endTime: TIME.test(endTime) ? endTime : null,
        excludeId,
      }).catch(() => null)

      // Une saisie plus récente a pu relancer une vérification entre-temps.
      if (request !== latestRequest.current) return
      setConflicts(res && 'conflicts' in res ? res.conflicts : [])
    }, 400)

    return () => clearTimeout(timer)
  }, [ready, kind, roomId, date, time, endTime, excludeId])

  if (conflicts.length === 0) return null

  return (
    <div
      role="status"
      className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex flex-col gap-1 text-sm">
        <p className="font-medium">Cette salle est déjà occupée sur ce créneau :</p>
        <ul className="flex flex-col gap-0.5">
          {conflicts.map((c) => (
            <li key={`${c.kind}-${c.id}`}>
              {c.kind === 'event' ? `« ${c.title} »` : c.title} · {formatTime(c.time)}
              {c.endTime ? ` – ${formatTime(c.endTime)}` : ' (fin non précisée)'}
            </li>
          ))}
        </ul>
        <p className="text-xs opacity-80">Vous pouvez enregistrer quand même.</p>
      </div>
    </div>
  )
}
