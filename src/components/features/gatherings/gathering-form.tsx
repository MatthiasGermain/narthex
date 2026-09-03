'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface GatheringData {
  id?: number
  title?: string
  startDate?: string
  endDate?: string
  location?: string
  description?: string
}

interface GatheringFormProps {
  mode: 'create' | 'edit'
  defaultValues?: GatheringData
  churchId: number
}

export function GatheringForm({ mode, defaultValues, churchId }: GatheringFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [startDate, setStartDate] = useState(defaultValues?.startDate ?? '')
  const [endDate, setEndDate] = useState(defaultValues?.endDate ?? '')
  const [location, setLocation] = useState(defaultValues?.location ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Le nom est requis'
    if (!startDate) newErrors.startDate = 'La date de début est requise'
    if (!endDate) newErrors.endDate = 'La date de fin est requise'
    else if (startDate && endDate < startDate) {
      newErrors.endDate = 'La date de fin doit suivre la date de début'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /** Un rassemblement d'un seul jour est légitime : on aligne la fin sur le début. */
  function handleStartDateChange(value: string) {
    setStartDate(value)
    if (!endDate || endDate < value) setEndDate(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const isEdit = mode === 'edit' && defaultValues?.id
      const url = isEdit ? `/api/gatherings/${defaultValues.id}` : '/api/gatherings'

      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          startDate,
          endDate,
          // null plutôt qu'undefined pour qu'un champ vidé le soit aussi côté serveur
          location: location.trim() || null,
          description: description.trim() || null,
          church: churchId,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(data?.errors?.[0]?.message || 'Une erreur est survenue')
        return
      }

      const data = await res.json().catch(() => null)
      const id = isEdit ? defaultValues.id : data?.doc?.id

      toast.success(mode === 'create' ? 'Rassemblement créé' : 'Rassemblement modifié')
      // On atterrit sur la fiche : c'est là qu'on rattache le programme.
      router.push(id ? `/dashboard/gatherings/${id}` : '/dashboard/gatherings')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-2">
        <Label htmlFor="gathering-title">Nom du rassemblement *</Label>
        <Input
          id="gathering-title"
          placeholder="Week-end d'église"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-col gap-2 sm:w-48">
          <Label htmlFor="gathering-start">Du *</Label>
          <Input
            id="gathering-start"
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            aria-invalid={!!errors.startDate}
          />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
        </div>
        <div className="flex flex-col gap-2 sm:w-48">
          <Label htmlFor="gathering-end">Au *</Label>
          <Input
            id="gathering-end"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            aria-invalid={!!errors.endDate}
          />
          {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="gathering-location">Lieu</Label>
        <Input
          id="gathering-location"
          placeholder="Centre de vacances des Vosges"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Optionnel — à renseigner si le rassemblement ne se tient pas à l’église.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="gathering-description">Description</Label>
        <Textarea
          id="gathering-description"
          placeholder="Quelques mots sur ce rassemblement..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? mode === 'create'
              ? 'Création...'
              : 'Enregistrement...'
            : mode === 'create'
              ? 'Créer le rassemblement'
              : 'Enregistrer'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(
              mode === 'edit' && defaultValues?.id
                ? `/dashboard/gatherings/${defaultValues.id}`
                : '/dashboard/gatherings',
            )
          }
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
