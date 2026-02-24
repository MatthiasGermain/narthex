'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

interface ProfileData {
  description?: string
  address?: {
    street?: string
    postalCode?: string
    city?: string
  }
  contact?: {
    email?: string
    phone?: string
    website?: string
  }
  social?: {
    facebook?: string
    instagram?: string
    youtube?: string
  }
}

interface ChurchProfileFormProps {
  mode: 'create' | 'edit'
  profileId?: number
  tenantId: number
  defaultValues?: ProfileData
}

export function ChurchProfileForm({ mode, profileId, tenantId, defaultValues }: ChurchProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [description, setDescription] = useState(defaultValues?.description ?? '')

  const [street, setStreet] = useState(defaultValues?.address?.street ?? '')
  const [postalCode, setPostalCode] = useState(defaultValues?.address?.postalCode ?? '')
  const [city, setCity] = useState(defaultValues?.address?.city ?? '')

  const [email, setEmail] = useState(defaultValues?.contact?.email ?? '')
  const [phone, setPhone] = useState(defaultValues?.contact?.phone ?? '')
  const [website, setWebsite] = useState(defaultValues?.contact?.website ?? '')

  const [facebook, setFacebook] = useState(defaultValues?.social?.facebook ?? '')
  const [instagram, setInstagram] = useState(defaultValues?.social?.instagram ?? '')
  const [youtube, setYoutube] = useState(defaultValues?.social?.youtube ?? '')

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email invalide'
    }
    if (website && !/^https?:\/\/.+/.test(website)) {
      newErrors.website = 'URL invalide (doit commencer par http:// ou https://)'
    }
    if (facebook && !/^https?:\/\/.+/.test(facebook)) {
      newErrors.facebook = 'URL invalide'
    }
    if (instagram && !/^https?:\/\/.+/.test(instagram)) {
      newErrors.instagram = 'URL invalide'
    }
    if (youtube && !/^https?:\/\/.+/.test(youtube)) {
      newErrors.youtube = 'URL invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      const url = mode === 'edit' && profileId
        ? `/api/church-profiles/${profileId}`
        : '/api/church-profiles'

      const res = await fetch(url, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim() || undefined,
          address: {
            street: street.trim() || undefined,
            postalCode: postalCode.trim() || undefined,
            city: city.trim() || undefined,
          },
          contact: {
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            website: website.trim() || undefined,
          },
          social: {
            facebook: facebook.trim() || undefined,
            instagram: instagram.trim() || undefined,
            youtube: youtube.trim() || undefined,
          },
          ...(mode === 'create' && { church: tenantId }),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = data?.errors?.[0]?.message || 'Une erreur est survenue'
        toast.error(message)
        return
      }

      toast.success('Profil enregistré')
      router.refresh()
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
      {/* Présentation */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Présentation</h2>
          <p className="text-sm text-muted-foreground">Texte affiché sur la page publique de votre église</p>
        </div>
        <Textarea
          id="description"
          placeholder="Présentez votre église en quelques paragraphes..."
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </section>

      <Separator />

      {/* Adresse */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Adresse</h2>
          <p className="text-sm text-muted-foreground">Localisation du lieu de culte</p>
        </div>
        <div className="flex flex-col gap-4">
          <Input
            id="street"
            placeholder="12 rue de la Paix"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
          <div className="grid grid-cols-[120px_1fr] gap-3">
            <Input
              id="postalCode"
              placeholder="75001"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
            <Input
              id="city"
              placeholder="Paris"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Contact */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Contact</h2>
          <p className="text-sm text-muted-foreground">Coordonnées visibles par les visiteurs</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@eglise.fr"
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
              placeholder="01 23 45 67 89"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="website">Site web</Label>
          <Input
            id="website"
            placeholder="https://mon-eglise.fr"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            aria-invalid={!!errors.website}
          />
          {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
        </div>
      </section>

      <Separator />

      {/* Réseaux sociaux */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Réseaux sociaux</h2>
          <p className="text-sm text-muted-foreground">Liens vers vos pages sur les réseaux</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              placeholder="https://facebook.com/votre-page"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              aria-invalid={!!errors.facebook}
            />
            {errors.facebook && <p className="text-sm text-destructive">{errors.facebook}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="https://instagram.com/votre-compte"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              aria-invalid={!!errors.instagram}
            />
            {errors.instagram && <p className="text-sm text-destructive">{errors.instagram}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              placeholder="https://youtube.com/@votre-chaine"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              aria-invalid={!!errors.youtube}
            />
            {errors.youtube && <p className="text-sm text-destructive">{errors.youtube}</p>}
          </div>
        </div>
      </section>

      <Separator />

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}
