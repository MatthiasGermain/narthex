'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DAY_OPTIONS = [
  { label: 'Lundi', value: 'monday' },
  { label: 'Mardi', value: 'tuesday' },
  { label: 'Mercredi', value: 'wednesday' },
  { label: 'Jeudi', value: 'thursday' },
  { label: 'Vendredi', value: 'friday' },
  { label: 'Samedi', value: 'saturday' },
  { label: 'Dimanche', value: 'sunday' },
]

interface ServiceEntry {
  label: string
  day: string
  time: string
  id?: string | null
}

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
  services?: ServiceEntry[]
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

  // Section 1 — Présentation
  const [description, setDescription] = useState(defaultValues?.description ?? '')

  // Section 2 — Adresse
  const [street, setStreet] = useState(defaultValues?.address?.street ?? '')
  const [postalCode, setPostalCode] = useState(defaultValues?.address?.postalCode ?? '')
  const [city, setCity] = useState(defaultValues?.address?.city ?? '')

  // Section 3 — Contact
  const [email, setEmail] = useState(defaultValues?.contact?.email ?? '')
  const [phone, setPhone] = useState(defaultValues?.contact?.phone ?? '')
  const [website, setWebsite] = useState(defaultValues?.contact?.website ?? '')

  // Section 4 — Horaires
  const [services, setServices] = useState<ServiceEntry[]>(
    defaultValues?.services?.map((s) => ({ ...s })) ?? []
  )

  // Section 5 — Réseaux sociaux
  const [facebook, setFacebook] = useState(defaultValues?.social?.facebook ?? '')
  const [instagram, setInstagram] = useState(defaultValues?.social?.instagram ?? '')
  const [youtube, setYoutube] = useState(defaultValues?.social?.youtube ?? '')

  function addService() {
    setServices([...services, { label: '', day: 'sunday', time: '10:00' }])
  }

  function removeService(index: number) {
    setServices(services.filter((_, i) => i !== index))
  }

  function updateService(index: number, field: keyof ServiceEntry, value: string) {
    setServices(services.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

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

    services.forEach((s, i) => {
      if (s.label && !s.time) {
        newErrors[`service-${i}-time`] = 'Heure requise'
      }
      if (s.time && !/^\d{2}:\d{2}$/.test(s.time)) {
        newErrors[`service-${i}-time`] = 'Format HH:mm'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      // Filtrer les services vides
      const validServices = services.filter((s) => s.label.trim())

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
          services: validServices.length > 0 ? validServices.map((s) => ({
            label: s.label.trim(),
            day: s.day,
            time: s.time,
          })) : [],
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

      toast.success('Profil enregistré ✓')
      router.refresh()
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {/* Section 1 — Présentation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Présentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description de l&apos;église</Label>
            <Textarea
              id="description"
              placeholder="Présentez votre église en quelques paragraphes..."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Texte affiché sur la page « À propos »
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Adresse */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adresse</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="street">Rue</Label>
            <Input
              id="street"
              placeholder="12 rue de la Paix"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                placeholder="75001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                placeholder="Paris"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3 — Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email de contact</Label>
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="website">Site web externe</Label>
            <Input
              id="website"
              placeholder="https://exemple.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              aria-invalid={!!errors.website}
            />
            {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Section 4 — Horaires des cultes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Horaires des cultes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {services.map((service, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-md border p-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`service-label-${index}`}>Type de culte</Label>
                <Input
                  id={`service-label-${index}`}
                  placeholder="Culte dominical"
                  value={service.label}
                  onChange={(e) => updateService(index, 'label', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Jour</Label>
                  <Select
                    value={service.day}
                    onValueChange={(v) => updateService(index, 'day', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_OPTIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`service-time-${index}`}>Heure</Label>
                  <Input
                    id={`service-time-${index}`}
                    type="time"
                    value={service.time}
                    onChange={(e) => updateService(index, 'time', e.target.value)}
                    aria-invalid={!!errors[`service-${index}-time`]}
                  />
                  {errors[`service-${index}-time`] && (
                    <p className="text-sm text-destructive">{errors[`service-${index}-time`]}</p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-end text-destructive hover:text-destructive"
                onClick={() => removeService(index)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addService}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter un horaire
          </Button>
        </CardContent>
      </Card>

      {/* Section 5 — Réseaux sociaux */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Réseaux sociaux</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}
