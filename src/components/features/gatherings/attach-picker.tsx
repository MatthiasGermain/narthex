'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, CalendarPlus, ClipboardList } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface AttachCandidate {
  id: number
  /** Titre affiché — pour un culte, son nom ou « Culte ». */
  label: string
  /** Date, et heure quand il y en a une. */
  meta: string
  /** Nom de l'autre rassemblement auquel il est déjà rattaché, le cas échéant. */
  attachedTo: string | null
}

interface AttachPickerProps {
  gatheringId: number
  /** Slug de la collection Payload à mettre à jour. */
  collection: 'events' | 'service-plans'
  candidates: AttachCandidate[]
  /** Lien de création, proposé en tête de liste. */
  createHref: string
  labels: {
    trigger: string
    create: string
    search: string
    /** Quand l'église n'a rien d'autre à rattacher. */
    empty: string
    one: string
    many: string
  }
}

export function AttachPicker({
  gatheringId,
  collection,
  candidates,
  createHref,
  labels,
}: AttachPickerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  const Icon = collection === 'events' ? CalendarPlus : ClipboardList

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return candidates
    return candidates.filter(
      (c) => c.label.toLowerCase().includes(q) || c.meta.toLowerCase().includes(q),
    )
  }, [candidates, search])

  function toggle(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  function reset() {
    setSearch('')
    setSelected([])
  }

  async function handleAttach() {
    if (selected.length === 0) return
    setSaving(true)
    try {
      const results = await Promise.all(
        selected.map((id) =>
          fetch(`/api/${collection}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gathering: gatheringId }),
          }),
        ),
      )

      const failed = results.filter((res) => !res.ok).length
      if (failed === results.length) {
        toast.error('Le rattachement a échoué')
        return
      }
      if (failed > 0) {
        toast.warning(`${results.length - failed} sur ${results.length} rattachés`)
      } else {
        const n = results.length
        toast.success(n === 1 ? `${labels.one} rattaché` : `${n} ${labels.many} rattachés`)
      }

      setOpen(false)
      reset()
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon className="h-4 w-4 mr-2" />
          {labels.trigger}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        {/* Créer prime sur rattacher : c'est le geste le plus fréquent */}
        <Link
          href={createHref}
          className="flex items-center gap-2 border-b px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          {labels.create}
        </Link>

        {candidates.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">{labels.empty}</p>
        ) : (
          <>
            <div className="border-b p-2">
              <Input
                placeholder={labels.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <div className="max-h-64 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                  Aucun résultat
                </p>
              ) : (
                filtered.map((c) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 hover:bg-muted"
                  >
                    <Checkbox
                      className="mt-0.5"
                      checked={selected.includes(c.id)}
                      onCheckedChange={() => toggle(c.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{c.label}</span>
                      <span className="block text-xs text-muted-foreground">{c.meta}</span>
                      {c.attachedTo && (
                        <span className="block text-xs text-amber-700 dark:text-amber-500">
                          Sera déplacé depuis « {c.attachedTo} »
                        </span>
                      )}
                    </span>
                  </label>
                ))
              )}
            </div>

            <div className="border-t p-2">
              <Button
                type="button"
                size="sm"
                className="w-full"
                disabled={selected.length === 0 || saving}
                onClick={handleAttach}
              >
                {saving
                  ? 'Rattachement...'
                  : selected.length === 0
                    ? 'Sélectionnez pour rattacher'
                    : `Rattacher (${selected.length})`}
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
