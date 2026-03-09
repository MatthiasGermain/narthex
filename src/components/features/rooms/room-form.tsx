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
import { Checkbox } from '@/components/ui/checkbox'

const EQUIPMENT_OPTIONS = [
  { label: 'Vidéoprojecteur', value: 'projector' },
  { label: 'Sono / Enceintes', value: 'sound' },
  { label: 'Piano', value: 'piano' },
  { label: 'Wi-Fi', value: 'wifi' },
  { label: 'Cuisine', value: 'kitchen' },
  { label: 'Tableau / Écran', value: 'board' },
] as const

interface RoomData {
  id?: number
  name?: string
  capacity?: number | null
  floor?: string
  description?: string
  equipment?: string[]
  accessibility?: boolean
  isActive?: boolean
  image?: number | { id: number; url?: string; sizes?: { thumbnail?: { url?: string } } } | null
}

interface RoomFormProps {
  mode: 'create' | 'edit'
  defaultValues?: RoomData
  churchId: number
}

const getInitialImage = (image: RoomData['image']) => getInitialMedia(image)

export function RoomForm({ mode, defaultValues, churchId }: RoomFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(defaultValues?.name ?? '')
  const [capacity, setCapacity] = useState(defaultValues?.capacity?.toString() ?? '')
  const [floor, setFloor] = useState(defaultValues?.floor ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [equipment, setEquipment] = useState<string[]>(defaultValues?.equipment ?? [])
  const [accessibility, setAccessibility] = useState(defaultValues?.accessibility ?? false)
  const [isActive, setIsActive] = useState(defaultValues?.isActive ?? true)

  const initialImage = getInitialImage(defaultValues?.image)
  const [imageId, setImageId] = useState<number | null>(initialImage.id)
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage.preview)
  const [uploading, setUploading] = useState(false)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Le nom est requis'
    if (capacity && (isNaN(Number(capacity)) || Number(capacity) < 1)) {
      newErrors.capacity = 'La capacité doit être un nombre positif'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('_payload', JSON.stringify({
        alt: name.trim() || file.name,
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

  function toggleEquipment(value: string) {
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      const url = mode === 'edit' && defaultValues?.id
        ? `/api/rooms/${defaultValues.id}`
        : '/api/rooms'

      const res = await fetch(url, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          capacity: capacity ? Number(capacity) : null,
          floor: floor.trim() || undefined,
          description: description.trim() || undefined,
          equipment: equipment.length > 0 ? equipment : undefined,
          accessibility,
          isActive,
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
        mode === 'create' ? 'Salle ajoutée' : 'Salle modifiée',
      )
      router.push('/dashboard/rooms')
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
      {/* Nom (pleine largeur) */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nom de la salle *</Label>
        <Input
          id="name"
          placeholder="Salle principale"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Capacité / Étage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="capacity">Capacité (personnes)</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            placeholder="50"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            aria-invalid={!!errors.capacity}
          />
          {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="floor">Étage / Localisation</Label>
          <Input
            id="floor"
            placeholder="RDC, 1er étage, Sous-sol..."
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          />
        </div>
      </div>

      {/* Description + Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Grande salle avec estrade..."
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-full min-h-40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Photo de la salle</Label>
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
                  <p className="text-sm text-muted-foreground text-center">Cliquer pour ajouter une photo</p>
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

      {/* Équipements */}
      <div className="flex flex-col gap-3">
        <Label>Équipements</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EQUIPMENT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={equipment.includes(opt.value)}
                onCheckedChange={() => toggleEquipment(opt.value)}
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Accessibilité + Disponibilité */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={accessibility}
            onCheckedChange={(checked) => setAccessibility(checked === true)}
          />
          <span className="text-sm">Accessible PMR (personnes à mobilité réduite)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(checked === true)}
          />
          <span className="text-sm">Salle actuellement disponible</span>
        </label>
      </div>

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
          onClick={() => router.push('/dashboard/rooms')}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
