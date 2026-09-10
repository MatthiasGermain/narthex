'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  addExtraAnnouncement,
  removeExtraAnnouncement,
  setAnnouncementHidden,
} from '@/app/(frontend)/dashboard/planning/announcement-actions'

/** Masque ou réintègre un événement ou un rassemblement dans la feuille. */
export function HideToggle({
  planId,
  kind,
  itemId,
  hidden,
  label,
}: {
  planId: number
  kind: 'event' | 'gathering'
  itemId: number
  hidden: boolean
  label: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
      disabled={pending}
      aria-label={hidden ? `Annoncer « ${label} »` : `Ne pas annoncer « ${label} »`}
      title={hidden ? 'Réintégrer dans les annonces' : 'Ne pas annoncer'}
      onClick={() =>
        startTransition(async () => {
          const res = await setAnnouncementHidden({ planId, kind, itemId, hidden: !hidden })
          if ('error' in res) {
            toast.error(res.error)
            return
          }
          router.refresh()
        })
      }
    >
      {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  )
}

/** Retire une annonce libre. */
export function RemoveExtraButton({
  planId,
  extraId,
  label,
}: {
  planId: number
  extraId: string
  label: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
      disabled={pending}
      aria-label={`Retirer l'annonce « ${label} »`}
      title="Retirer l'annonce"
      onClick={() =>
        startTransition(async () => {
          const res = await removeExtraAnnouncement({ planId, extraId })
          if ('error' in res) {
            toast.error(res.error)
            return
          }
          router.refresh()
        })
      }
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}

/** Ajout d'une annonce sans événement : collecte, nouvelle d'une famille, appel à bénévoles… */
export function ExtraAnnouncementForm({ planId }: { planId: number }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [pending, startTransition] = useTransition()

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          const res = await addExtraAnnouncement({ planId, title, details })
          if ('error' in res) {
            toast.error(res.error)
            return
          }
          setTitle('')
          setDetails('')
          toast.success('Annonce ajoutée')
          router.refresh()
        })
      }}
    >
      <Input
        placeholder="Ex : Collecte pour la famille Martin"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        aria-label="Titre de l'annonce"
      />
      <Textarea
        placeholder="Détails (optionnel)"
        rows={2}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        maxLength={2000}
        aria-label="Détails de l'annonce"
      />
      <Button
        type="submit"
        size="sm"
        variant="outline"
        className="self-start"
        disabled={pending || !title.trim()}
      >
        <Plus className="mr-2 h-4 w-4" />
        {pending ? 'Ajout...' : 'Ajouter une annonce'}
      </Button>
    </form>
  )
}
