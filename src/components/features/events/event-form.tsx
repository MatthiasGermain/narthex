'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Upload, X, Loader2 } from 'lucide-react'
import { getInitialMedia } from '@/lib/image-utils'
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

interface RoomOption {
  id: number
  name: string
}

interface GatheringOption {
  id: number
  title: string
}

interface EventData {
  id?: number
  title?: string
  date?: string
  time?: string
  location?: string
  description?: string
  visibility?: 'public' | 'internal'
  room?: number | null
  gathering?: number | null
  image?: number | { id: number; url?: string; sizes?: { thumbnail?: { url?: string } }; alt?: string } | null
}

interface EventFormProps {
  mode: 'create' | 'edit'
  defaultValues?: EventData
  churchId: number
  rooms?: RoomOption[]
  gatherings?: GatheringOption[]
}

const getInitialImage = (image: EventData['image']) => getInitialMedia(image)

export function EventForm({
  mode,
  defaultValues,
  churchId,
  rooms = [],
  gatherings = [],
}: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [date, setDate] = useState(defaultValues?.date ?? '')
  const [time, setTime] = useState(defaultValues?.time ?? '')
  const [location, setLocation] = useState(defaultValues?.location ?? '')
  const [roomId, setRoomId] = useState<string>(defaultValues?.room?.toString() ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [visibility, setVisibility] = useState<string>(defaultValues?.visibility ?? 'public')
  const [gatheringId, setGatheringId] = useState<string>(
    defaultValues?.gathering != null ? String(defaultValues.gathering) : '',
  )

  const initialImage = getInitialImage(defaultValues?.image)
  const [imageId, setImageId] = useState<number | null>(initialImage.id)
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage.preview)
  const [uploading, setUploading] = useState(false)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Le titre est requis'
    if (!date) newErrors.date = 'La date est requise'
    if (!time) newErrors.time = "L'heure est requise"
    else if (!/^\d{2}:\d{2}$/.test(time)) newErrors.time = 'Format attendu : HH:mm'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('_payload', JSON.stringify({
        alt: title.trim() || file.name,
        church: churchId,
      }))

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        toast.error("Erreur lors de l'upload de l'image")
        return
      }

      const data = await res.json()
      setImageId(data.doc.id)
      setImagePreview(data.doc.sizes?.thumbnail?.url || data.doc.url)
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de l'upload de l'image")
    } finally {
      setUploading(false)
    }
  }

  function removeImage() {
    setImageId(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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
          room: roomId ? Number(roomId) : null,
          location: location.trim() || undefined,
          description: description.trim() || undefined,
          visibility,
          gathering: gatheringId ? Number(gatheringId) : null,
          image: imageId || '',
          church: churchId,
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
    } catch (err) {
      console.error(err)
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      {/* Ligne 1 : Titre (pleine largeur) */}
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

      {/* Ligne 2 : Date / Heure / Lieu sur desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Lieu</Label>
          <Input
            id="location"
            placeholder="Temple de Belleville"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      {/* Salle */}
      {rooms.length > 0 && (
        <div className="flex flex-col gap-2 max-w-xs">
          <Label htmlFor="room">Salle</Label>
          <Select value={roomId || 'none'} onValueChange={(v) => setRoomId(v === 'none' ? '' : v)}>
            <SelectTrigger id="room">
              <SelectValue placeholder="Aucune salle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune salle</SelectItem>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Ligne 3 : Description + Image cote a cote sur desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Détails de l'événement..."
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-full min-h-40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Image / Affiche</Label>
          {imagePreview ? (
            <div className="relative">
              <Image
                src={imagePreview}
                alt="Preview"
                width={400}
                height={300}
                className="rounded-lg border object-cover w-full h-auto"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 shadow-md hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 cursor-pointer hover:border-primary/50 transition-colors h-full min-h-40"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                  <p className="text-sm text-muted-foreground">Upload en cours...</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">Cliquer pour ajouter une image</p>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageUpload(file)
            }}
          />
        </div>
      </div>

      {/* Ligne 4 : Visibilite */}
      <div className="flex flex-col gap-2 max-w-xs">
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

      {/* Rattachement : masque tant que l'eglise n'a cree aucun rassemblement */}
      {gatherings.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="gathering">Fait partie de</Label>
          <Select
            value={gatheringId || 'none'}
            onValueChange={(v) => setGatheringId(v === 'none' ? '' : v)}
          >
            <SelectTrigger id="gathering">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun rassemblement</SelectItem>
              {gatherings.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading || uploading}>
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
