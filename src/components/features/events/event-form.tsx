'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EventData {
  id?: number
  title?: string
  date?: string
  time?: string
  location?: string
  description?: string
  visibility?: 'public' | 'internal'
}

interface EventFormProps {
  mode: 'create' | 'edit'
  defaultValues?: EventData
}

export function EventForm({ mode, defaultValues }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [date, setDate] = useState(defaultValues?.date ?? '')
  const [time, setTime] = useState(defaultValues?.time ?? '')
  const [location, setLocation] = useState(defaultValues?.location ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [visibility, setVisibility] = useState<string>(defaultValues?.visibility ?? 'public')

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Le titre est requis'
    if (!date) newErrors.date = 'La date est requise'
    if (!time) newErrors.time = "L'heure est requise"
    else if (!/^\d{2}:\d{2}$/.test(time)) newErrors.time = 'Format attendu : HH:mm'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      const url = mode === 'edit' && defaultValues?.id
        ? `/api/events/${defaultValues.id}`
        : '/api/events'

      const res = await fetch(url, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          date,
          time,
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          visibility,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.errors?.[0]?.message || 'Une erreur est survenue'
        toast.error(message)
        return
      }

      toast.success(
        mode === 'create' ? 'Événement ajouté ✓' : 'Événement modifié ✓'
      )
      router.push('/dashboard/events')
      router.refresh()
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          placeholder="Concert de Noël"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={!!errors.date}
          />
          {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="time">Heure *</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-invalid={!!errors.time}
          />
          {errors.time && <p className="text-sm text-destructive">{errors.time}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Lieu</Label>
        <Input
          id="location"
          placeholder="Temple de Belleville"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Détails de l'événement..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="visibility">Visibilité</Label>
        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger id="visibility">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public — visible sur le site</SelectItem>
            <SelectItem value="internal">Interne — membres uniquement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? (mode === 'create' ? 'Ajout...' : 'Enregistrement...')
            : (mode === 'create' ? 'Ajouter' : 'Enregistrer')
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/events')}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
