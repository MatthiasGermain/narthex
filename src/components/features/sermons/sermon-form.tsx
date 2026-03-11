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

interface MemberOption {
  id: number
  firstName: string
  lastName: string
}

interface SermonData {
  id?: number
  title?: string
  date?: string
  preacher?: number | null
  series?: string
  scripture?: string
  description?: string
  audioFile?: number | { id: number; url?: string; filename?: string } | null
  videoUrl?: string
  image?: number | { id: number; url?: string; sizes?: { thumbnail?: { url?: string } }; alt?: string } | null
  visibility?: 'public' | 'internal'
}

interface SermonFormProps {
  mode: 'create' | 'edit'
  defaultValues?: SermonData
  churchId: number
  members?: MemberOption[]
}

export function SermonForm({ mode, defaultValues, churchId, members = [] }: SermonFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [date, setDate] = useState(defaultValues?.date ?? '')
  const [preacherId, setPreacherId] = useState<string>(defaultValues?.preacher?.toString() ?? '')
  const [series, setSeries] = useState(defaultValues?.series ?? '')
  const [scripture, setScripture] = useState(defaultValues?.scripture ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [videoUrl, setVideoUrl] = useState(defaultValues?.videoUrl ?? '')
  const [visibility, setVisibility] = useState<string>(defaultValues?.visibility ?? 'public')

  const initialImage = getInitialMedia(defaultValues?.image)
  const [imageId, setImageId] = useState<number | null>(initialImage.id)
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage.preview)
  const [uploadingImage, setUploadingImage] = useState(false)

  const initialAudio = getInitialMedia(defaultValues?.audioFile)
  const [audioId, setAudioId] = useState<number | null>(initialAudio.id)
  const [audioFilename, setAudioFilename] = useState<string | null>(
    defaultValues?.audioFile && typeof defaultValues.audioFile === 'object'
      ? defaultValues.audioFile.filename ?? null
      : null
  )
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Le titre est requis'
    if (!date) newErrors.date = 'La date est requise'
    if (videoUrl && !/^https?:\/\/.+/.test(videoUrl)) {
      newErrors.videoUrl = 'URL invalide (doit commencer par http:// ou https://)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true)
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
    } catch {
      toast.error("Erreur lors de l'upload de l'image")
    } finally {
      setUploadingImage(false)
    }
  }

  function handleAudioUpload(file: File) {
    setUploadingAudio(true)
    setAudioProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('_payload', JSON.stringify({
      alt: title.trim() || file.name,
      church: churchId,
    }))

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setAudioProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          setAudioId(data.doc.id)
          setAudioFilename(data.doc.filename || file.name)
        } catch {
          toast.error("Erreur lors de l'upload audio")
        }
      } else {
        toast.error("Erreur lors de l'upload audio")
      }
      setUploadingAudio(false)
      setAudioProgress(0)
    })

    xhr.addEventListener('error', () => {
      toast.error("Erreur lors de l'upload audio")
      setUploadingAudio(false)
      setAudioProgress(0)
    })

    xhr.open('POST', '/api/audio-media')
    xhr.send(formData)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      const url = mode === 'edit' && defaultValues?.id
        ? `/api/sermons/${defaultValues.id}`
        : '/api/sermons'

      const res = await fetch(url, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          date,
          preacher: preacherId ? Number(preacherId) : null,
          series: series.trim() || undefined,
          scripture: scripture.trim() || undefined,
          description: description.trim() || undefined,
          audioFile: audioId || '',
          videoUrl: videoUrl.trim() || undefined,
          image: imageId || '',
          visibility,
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
        mode === 'create' ? 'Prédication ajoutée' : 'Prédication modifiée'
      )
      router.push('/dashboard/sermons')
      router.refresh()
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const isUploading = uploadingImage || uploadingAudio

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      {/* Titre */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          placeholder="Le bon berger"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>

      {/* Date / Prédicateur */}
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
          <Label htmlFor="preacher">Prédicateur</Label>
          <Select value={preacherId || 'none'} onValueChange={(v) => setPreacherId(v === 'none' ? '' : v)}>
            <SelectTrigger id="preacher">
              <SelectValue placeholder="Sélectionner..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Non spécifié</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.firstName} {m.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Série / Passage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="series">Série</Label>
          <Input
            id="series"
            placeholder="Les paraboles de Jésus"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="scripture">Passage biblique</Label>
          <Input
            id="scripture"
            placeholder="Jean 10:1-18"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
          />
        </div>
      </div>

      {/* Description + Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description / Résumé</Label>
          <Textarea
            id="description"
            placeholder="Résumé de la prédication..."
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-full min-h-40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Image / Couverture</Label>
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
                onClick={() => {
                  setImageId(null)
                  setImagePreview(null)
                  if (imageInputRef.current) imageInputRef.current.value = ''
                }}
                className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 shadow-md hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => !uploadingImage && imageInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 cursor-pointer hover:border-primary/50 transition-colors h-full min-h-40"
            >
              {uploadingImage ? (
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
            ref={imageInputRef}
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

      {/* Audio */}
      <div className="flex flex-col gap-2">
        <Label>Fichier audio</Label>
        {audioFilename ? (
          <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
            <span className="text-sm truncate flex-1">{audioFilename}</span>
            <button
              type="button"
              onClick={() => {
                setAudioId(null)
                setAudioFilename(null)
                if (audioInputRef.current) audioInputRef.current.value = ''
              }}
              className="rounded-full bg-destructive text-destructive-foreground p-1 shadow-md hover:bg-destructive/90 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => !uploadingAudio && audioInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-4 cursor-pointer hover:border-primary/50 transition-colors"
          >
            {uploadingAudio ? (
              <div className="w-full flex flex-col items-center gap-2">
                <div className="w-full max-w-xs h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{audioProgress}%</p>
              </div>
            ) : (
              <>
                <Upload className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Cliquer pour ajouter un fichier audio</p>
              </>
            )}
          </div>
        )}
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleAudioUpload(file)
          }}
        />
      </div>

      {/* Vidéo URL */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="videoUrl">Lien vidéo</Label>
        <Input
          id="videoUrl"
          placeholder="https://youtube.com/watch?v=..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          aria-invalid={!!errors.videoUrl}
        />
        {errors.videoUrl && <p className="text-sm text-destructive">{errors.videoUrl}</p>}
      </div>

      {/* Visibilité */}
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

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading || isUploading}>
          {loading
            ? (mode === 'create' ? 'Ajout...' : 'Enregistrement...')
            : (mode === 'create' ? 'Ajouter' : 'Enregistrer')
          }
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/sermons')}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
