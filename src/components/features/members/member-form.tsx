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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CHURCH_ROLE_OPTIONS } from '@/lib/church-roles'

interface MemberData {
  id?: number
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  churchRole?: string
  birthDate?: string
  isActive?: boolean
  photo?: number | { id: number; url?: string; sizes?: { thumbnail?: { url?: string } } } | null
  user?: number | { id: number; email?: string } | null
}

interface MemberFormProps {
  mode: 'create' | 'edit'
  defaultValues?: MemberData
  churchId: number
  userRole: string
}

const getInitialPhoto = (photo: MemberData['photo']) => getInitialMedia(photo)

function getLinkedUser(user: MemberData['user']): { id: number | null; email: string | null } {
  if (!user) return { id: null, email: null }
  if (typeof user === 'number') return { id: user, email: null }
  return { id: user.id, email: user.email || null }
}

export function MemberForm({ mode, defaultValues, churchId, userRole }: MemberFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState(defaultValues?.firstName ?? '')
  const [lastName, setLastName] = useState(defaultValues?.lastName ?? '')
  const [email, setEmail] = useState(defaultValues?.email ?? '')
  const [phone, setPhone] = useState(defaultValues?.phone ?? '')
  const [churchRole, setChurchRole] = useState(defaultValues?.churchRole ?? 'membre')
  const [birthDate, setBirthDate] = useState(defaultValues?.birthDate ?? '')
  const [isActive, setIsActive] = useState(defaultValues?.isActive ?? true)

  const initialPhoto = getInitialPhoto(defaultValues?.photo)
  const [photoId, setPhotoId] = useState<number | null>(initialPhoto.id)
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhoto.preview)
  const [uploading, setUploading] = useState(false)

  const initialUser = getLinkedUser(defaultValues?.user)
  const [linkedUserId, setLinkedUserId] = useState<number | null>(initialUser.id)
  const [linkedUserEmail, setLinkedUserEmail] = useState<string | null>(initialUser.email)

  const [createAccount, setCreateAccount] = useState(false)

  const isAdminUser = userRole === 'super-admin' || userRole === 'admin-church'

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!firstName.trim()) newErrors.firstName = 'Le prénom est requis'
    if (!lastName.trim()) newErrors.lastName = 'Le nom est requis'
    if (createAccount && !linkedUserId && !email.trim()) {
      newErrors.email = 'L\'email est requis pour créer un compte'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handlePhotoUpload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
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

  function removePhoto() {
    setPhotoId(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleCreateUserAccount(): Promise<number> {
    const userEmail = email.trim()
    const randomPassword = crypto.randomUUID()

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        password: randomPassword,
        role: 'volunteer',
        tenants: [{ tenant: churchId }],
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.errors?.[0]?.message || 'Erreur lors de la création du compte')
    }
    const data = await res.json()

    // Déclencher l'envoi de l'email d'invitation (reset password)
    await fetch('/api/users/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail }),
    })

    return data.doc.id
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      let userIdToLink = linkedUserId
      let autoCreatedMemberId: number | null = null

      if (createAccount && !linkedUserId) {
        try {
          userIdToLink = await handleCreateUserAccount()
          toast.success('Compte créé — invitation envoyée par email')

          // The autoCreateMember hook may have created a member — find it
          const searchRes = await fetch(
            `/api/members?where[user][equals]=${userIdToLink}&limit=1&depth=0`,
          )
          if (searchRes.ok) {
            const searchData = await searchRes.json()
            if (searchData.docs?.length > 0) {
              autoCreatedMemberId = searchData.docs[0].id
            }
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Erreur lors de la création du compte')
          setLoading(false)
          return
        }
      }

      const memberBody = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        churchRole,
        birthDate: birthDate || undefined,
        isActive,
        photo: photoId || '',
        user: userIdToLink || '',
        church: churchId,
      }

      // Determine URL and method:
      // - edit mode → PATCH existing
      // - hook auto-created a member → PATCH that one
      // - otherwise → POST new
      let url: string
      let method: string
      if (mode === 'edit' && defaultValues?.id) {
        url = `/api/members/${defaultValues.id}`
        method = 'PATCH'
      } else if (autoCreatedMemberId) {
        url = `/api/members/${autoCreatedMemberId}`
        method = 'PATCH'
      } else {
        url = '/api/members'
        method = 'POST'
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberBody),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.errors?.[0]?.message || 'Une erreur est survenue'
        toast.error(message)
        return
      }

      toast.success(mode === 'create' ? 'Membre ajouté' : 'Membre modifié')
      router.push('/dashboard/members')
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
      {/* Prénom / Nom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            id="firstName"
            placeholder="Jean"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            placeholder="Dupont"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      {/* Email / Téléphone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jean.dupont@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            placeholder="06 12 34 56 78"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Rôle dans l'église */}
      <div className="flex flex-col gap-2 max-w-xs">
        <Label htmlFor="churchRole">Rôle dans l&apos;église</Label>
        <Select value={churchRole} onValueChange={setChurchRole}>
          <SelectTrigger id="churchRole">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHURCH_ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date de naissance */}
      <div className="flex flex-col gap-2 max-w-xs">
        <Label htmlFor="birthDate">Date de naissance</Label>
        <Input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>

      {/* Photo */}
      <div className="flex flex-col gap-2 max-w-sm">
        <Label>Photo</Label>
        {photoPreview ? (
          <div className="relative">
            <Image
              src={photoPreview}
              alt="Preview"
              width={400}
              height={300}
              className="rounded-lg border object-cover w-full h-auto"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 shadow-md hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 cursor-pointer hover:border-primary/50 transition-colors min-h-40"
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
            if (file) handlePhotoUpload(file)
          }}
        />
      </div>

      {/* Membre actif */}
      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(checked === true)}
        />
        <span className="text-sm">Membre actif</span>
      </label>

      {/* Section Compte utilisateur (admin uniquement) */}
      {isAdminUser && (
        <>
          <Separator />
          <div className="flex flex-col gap-4">
            <h3 className="font-heading font-bold text-lg">Compte utilisateur</h3>

            {linkedUserId ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="flex-1">
                  <p className="text-sm font-medium">Compte lié</p>
                  <p className="text-sm text-muted-foreground">
                    {linkedUserEmail || `Utilisateur #${linkedUserId}`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLinkedUserId(null)
                    setLinkedUserEmail(null)
                  }}
                >
                  Délier
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={createAccount}
                      onCheckedChange={(checked) => setCreateAccount(checked === true)}
                    />
                    <span className="text-sm">Créer un compte utilisateur pour ce membre</span>
                  </label>
                  <p className="text-xs text-muted-foreground pl-6">
                    Ce membre pourra se connecter à Narthex avec l&apos;email renseigné ci-dessus. Une invitation lui sera envoyée pour définir son mot de passe.
                  </p>
                </div>

                {createAccount && !email.trim() && (
                  <p className="text-sm text-destructive pl-6">
                    Veuillez renseigner l&apos;email du membre pour créer un compte.
                  </p>
                )}
              </>
            )}
          </div>
        </>
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
          onClick={() => router.push('/dashboard/members')}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
