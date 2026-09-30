'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Camera, KeyRound } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateMyProfile, requestPasswordReset } from '@/app/(frontend)/dashboard/account/actions'

interface AccountProfileFormProps {
  memberId: number
  churchId: number
  defaultValues: {
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
    birthDate?: string | null
    churchRole?: string | null
    photoUrl?: string | null
    photoId?: number | null
  }
  churchRoleLabel?: string
}

export function AccountProfileForm({ memberId, churchId, defaultValues, churchRoleLabel }: AccountProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [firstName, setFirstName] = useState(defaultValues.firstName)
  const [lastName, setLastName] = useState(defaultValues.lastName)
  const [phone, setPhone] = useState(defaultValues.phone ?? '')
  const [birthDate, setBirthDate] = useState(defaultValues.birthDate?.split('T')[0] ?? '')
  const [photoId, setPhotoId] = useState<number | null>(defaultValues.photoId ?? null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(defaultValues.photoUrl ?? null)
  const [uploading, setUploading] = useState(false)

  // Dirty detection
  const isDirty = useMemo(() => {
    return (
      firstName !== defaultValues.firstName ||
      lastName !== defaultValues.lastName ||
      phone !== (defaultValues.phone ?? '') ||
      birthDate !== (defaultValues.birthDate?.split('T')[0] ?? '') ||
      photoId !== (defaultValues.photoId ?? null)
    )
  }, [firstName, lastName, phone, birthDate, photoId, defaultValues])

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      // `church` est requis sur les médias : sans lui l'upload était rejeté.
      formData.append('_payload', JSON.stringify({
        alt: `${firstName} ${lastName}`.trim() || file.name,
        church: churchId,
      }))

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        toast.error("Erreur lors de l'upload de la photo")
        return
      }

      const data = await res.json()
      setPhotoId(data.doc.id)
      setPhotoPreview(data.doc.sizes?.thumbnail?.url || data.doc.url)
    } catch (err) {
      console.error(err)
      toast.error("Erreur lors de l'upload de la photo")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Le prénom et le nom sont requis')
      return
    }

    setLoading(true)
    try {
      const result = await updateMyProfile(memberId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        birthDate: birthDate || undefined,
        photo: photoId,
      })

      if (result.success) {
        toast.success('Profil mis à jour')
      } else {
        toast.error(result.error || 'Erreur')
      }
    } catch (err) {
      console.error(err)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    if (!defaultValues.email) return
    setResetLoading(true)
    try {
      const result = await requestPasswordReset()
      if (result.success) {
        toast.success('Un email de réinitialisation a été envoyé')
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi')
      }
    } catch (err) {
      console.error(err)
      toast.error('Une erreur est survenue')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <label className="relative cursor-pointer group shrink-0">
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-raisin/8 bg-raisin/5 flex items-center justify-center">
            {photoPreview ? (
              <Image
                src={photoPreview}
                alt={`${firstName} ${lastName}`}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-raisin/30">
                {firstName?.[0]?.toUpperCase()}{lastName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-raisin/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
            disabled={uploading}
          />
        </label>
        <div className="flex flex-col gap-1">
          <p className="font-heading font-bold text-lg">{firstName} {lastName}</p>
          {churchRoleLabel && (
            <p className="text-sm text-muted-foreground">{churchRoleLabel}</p>
          )}
          {uploading && <p className="text-xs text-muted-foreground">Upload en cours...</p>}
        </div>
      </div>

      {/* Champs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={defaultValues.email ?? ''}
          disabled
          className="opacity-60"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            placeholder="06 12 34 56 78"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="birthDate">Date de naissance</Label>
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="submit" disabled={!isDirty || loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={handleResetPassword}
          disabled={resetLoading}
        >
          <KeyRound className="h-3.5 w-3.5" />
          {resetLoading ? 'Envoi...' : 'Changer le mot de passe'}
        </Button>
      </div>
    </form>
  )
}
