'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface BulkSelectContextValue {
  selected: Set<number>
  toggle: (id: number) => void
  toggleMany: (ids: number[], checked: boolean) => void
  clear: () => void
}

const BulkSelectContext = createContext<BulkSelectContextValue | null>(null)

function useBulkSelect() {
  const ctx = useContext(BulkSelectContext)
  if (!ctx) throw new Error('useBulkSelect doit être utilisé dans un <BulkSelectProvider>')
  return ctx
}

export function BulkSelectProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const toggle = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleMany = useCallback((ids: number[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)))
      return next
    })
  }, [])

  const clear = useCallback(() => setSelected(new Set()), [])

  return (
    <BulkSelectContext.Provider value={{ selected, toggle, toggleMany, clear }}>
      {children}
    </BulkSelectContext.Provider>
  )
}

/** Case à cocher pour une ligne/carte. À placer dans une cellule `relative z-10`. */
export function BulkCheckbox({ id, label }: { id: number; label: string }) {
  const { selected, toggle } = useBulkSelect()
  return (
    <Checkbox
      checked={selected.has(id)}
      onCheckedChange={() => toggle(id)}
      aria-label={label}
    />
  )
}

/** Case « tout sélectionner » pour un groupe d'ids (en-tête de table). */
export function BulkSelectAll({ ids, label }: { ids: number[]; label: string }) {
  const { selected, toggleMany } = useBulkSelect()
  const allChecked = ids.length > 0 && ids.every((id) => selected.has(id))
  const someChecked = ids.some((id) => selected.has(id))
  return (
    <Checkbox
      checked={allChecked ? true : someChecked ? 'indeterminate' : false}
      onCheckedChange={() => toggleMany(ids, !allChecked)}
      aria-label={label}
    />
  )
}

interface BulkActionBarProps {
  /** Slug de la collection Payload (ex: "events", "service-plans") */
  collection: string
  /** Mot singulier/pluriel pour les messages, ex: { one: 'culte', many: 'cultes' } */
  noun: { one: string; many: string }
}

/** Barre flottante d'actions groupées. N'apparaît que si au moins un élément est sélectionné. */
export function BulkActionBar({ collection, noun }: BulkActionBarProps) {
  const { selected, clear } = useBulkSelect()
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const count = selected.size
  if (count === 0) return null

  const label = count > 1 ? `${count} ${noun.many}` : `1 ${noun.one}`

  async function handleDelete() {
    setDeleting(true)
    const ids = [...selected]
    try {
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/${collection}/${id}`, { method: 'DELETE' }).then((res) => {
            if (!res.ok) throw new Error(String(id))
          }),
        ),
      )
      const failed = results.filter((r) => r.status === 'rejected').length
      const ok = ids.length - failed
      if (ok > 0) toast.success(`${ok} ${ok > 1 ? noun.many : noun.one} supprimé${ok > 1 ? 's' : ''}`)
      if (failed > 0)
        toast.error(`${failed} ${failed > 1 ? noun.many : noun.one} n'ont pas pu être supprimés`)
      clear()
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Une erreur est survenue')
    } finally {
      setDeleting(false)
      setShowDelete(false)
    }
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-raisin/10 bg-background px-4 py-2 shadow-lg">
          <span className="text-sm font-medium">{label} sélectionné{count > 1 ? 's' : ''}</span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowDelete(true)}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={clear} aria-label="Annuler la sélection">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {label} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les éléments sélectionnés seront définitivement
              supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
