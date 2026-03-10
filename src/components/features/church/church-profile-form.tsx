'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight, ChevronDown, Trash2 } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
  id?: string
}

interface BeliefItem {
  title: string
  content: string
  id?: string
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
  visitInfo?: {
    duration?: string
    serviceFlow?: string
    childrenInfo?: string
    parking?: string
  }
  faq?: FaqItem[]
  denomination?: string
  beliefs?: BeliefItem[]
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

  const [duration, setDuration] = useState(defaultValues?.visitInfo?.duration ?? '')
  const [serviceFlow, setServiceFlow] = useState(defaultValues?.visitInfo?.serviceFlow ?? '')
  const [childrenInfo, setChildrenInfo] = useState(defaultValues?.visitInfo?.childrenInfo ?? '')
  const [parking, setParking] = useState(defaultValues?.visitInfo?.parking ?? '')

  const [faq, setFaq] = useState<FaqItem[]>(defaultValues?.faq ?? [])
  const [faqPage, setFaqPage] = useState(0)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const FAQ_PER_PAGE = 9

  const [denomination, setDenomination] = useState(defaultValues?.denomination ?? '')
  const [beliefs, setBeliefs] = useState<BeliefItem[]>(defaultValues?.beliefs ?? [])
  const [beliefsOpen, setBeliefsOpen] = useState<number | null>(null)

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
          visitInfo: {
            duration: duration.trim() || undefined,
            serviceFlow: serviceFlow.trim() || undefined,
            childrenInfo: childrenInfo.trim() || undefined,
            parking: parking.trim() || undefined,
          },
          faq: faq.filter(f => f.question.trim() && f.answer.trim()).map(f => ({
            question: f.question.trim(),
            answer: f.answer.trim(),
          })),
          denomination: denomination.trim() || undefined,
          beliefs: beliefs.filter(b => b.title.trim() && b.content.trim()).map(b => ({
            title: b.title.trim(),
            content: b.content.trim(),
          })),
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-4xl">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="contact">Contact & Réseaux</TabsTrigger>
          <TabsTrigger value="visit">Première visite</TabsTrigger>
          <TabsTrigger value="beliefs">Confession de foi</TabsTrigger>
        </TabsList>

        {/* ─── Onglet Général ─── */}
        <TabsContent value="general" className="flex flex-col gap-8 pt-6">
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
        </TabsContent>

        {/* ─── Onglet Contact & Réseaux ─── */}
        <TabsContent value="contact" className="flex flex-col gap-8 pt-6">
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
        </TabsContent>

        {/* ─── Onglet Première visite ─── */}
        <TabsContent value="visit" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche — Infos pratiques */}
            <section className="flex flex-col gap-4">
              <div>
                <h2 className="text-base font-semibold">Infos pratiques</h2>
                <p className="text-sm text-muted-foreground">Informations pour les nouveaux visiteurs</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="duration">Durée du culte</Label>
                <Input
                  id="duration"
                  placeholder="Environ 1h30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="serviceFlow">Déroulé du culte</Label>
                <Textarea
                  id="serviceFlow"
                  placeholder="Décrivez le déroulement type du culte..."
                  rows={3}
                  value={serviceFlow}
                  onChange={(e) => setServiceFlow(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="childrenInfo">Accueil des enfants</Label>
                <Textarea
                  id="childrenInfo"
                  placeholder="Garderie, école du dimanche, tranches d'âge..."
                  rows={3}
                  value={childrenInfo}
                  onChange={(e) => setChildrenInfo(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="parking">Parking / accès</Label>
                <Input
                  id="parking"
                  placeholder="Parking gratuit sur place, accès PMR"
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                />
              </div>
            </section>

            {/* Colonne droite — FAQ */}
            <section className="flex flex-col gap-4 min-h-[520px]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">Questions fréquentes</h2>
                  <p className="text-sm text-muted-foreground">
                    {faq.length > 0 ? `${faq.length} question${faq.length > 1 ? 's' : ''}` : 'FAQ page « Première visite »'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFaq([...faq, { question: '', answer: '' }])
                    const newPage = Math.floor(faq.length / FAQ_PER_PAGE)
                    setFaqPage(newPage)
                    setFaqOpen(faq.length)
                  }}
                >
                  + Ajouter
                </Button>
              </div>

              {faq.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground italic">
                    Aucune question pour le moment
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex-1 flex flex-col rounded-lg border divide-y overflow-y-auto">
                    {faq
                      .slice(faqPage * FAQ_PER_PAGE, (faqPage + 1) * FAQ_PER_PAGE)
                      .map((item, pageIndex) => {
                        const realIndex = faqPage * FAQ_PER_PAGE + pageIndex
                        const isOpen = faqOpen === realIndex
                        return (
                          <div key={item.id ?? realIndex}>
                            <button
                              type="button"
                              className="flex items-center justify-between w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors"
                              onClick={() => setFaqOpen(isOpen ? null : realIndex)}
                            >
                              <span className="font-medium truncate pr-2">
                                {item.question || `Question ${realIndex + 1}`}
                              </span>
                              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-4 flex flex-col gap-3">
                                <Input
                                  placeholder="Votre question..."
                                  value={item.question}
                                  onChange={(e) => {
                                    const updated = [...faq]
                                    updated[realIndex] = { ...updated[realIndex], question: e.target.value }
                                    setFaq(updated)
                                  }}
                                />
                                <div className="flex flex-col gap-2">
                                  <Label>Réponse</Label>
                                  <Textarea
                                    placeholder="Votre réponse..."
                                    rows={3}
                                    value={item.answer}
                                    onChange={(e) => {
                                      const updated = [...faq]
                                      updated[realIndex] = { ...updated[realIndex], answer: e.target.value }
                                      setFaq(updated)
                                    }}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive self-end gap-1.5"
                                  onClick={() => {
                                    setFaq(faq.filter((_, i) => i !== realIndex))
                                    setFaqOpen(null)
                                    if (faqPage > 0 && faqPage * FAQ_PER_PAGE >= faq.length - 1) {
                                      setFaqPage(faqPage - 1)
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Supprimer
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </>
              )}

              {/* Pagination — toujours en bas de la colonne */}
              {faq.length > FAQ_PER_PAGE && (
                <div className="flex items-center justify-between pt-1 mt-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={faqPage === 0}
                    onClick={() => { setFaqPage(faqPage - 1); setFaqOpen(null) }}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {faqPage + 1} / {Math.ceil(faq.length / FAQ_PER_PAGE)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={(faqPage + 1) * FAQ_PER_PAGE >= faq.length}
                    onClick={() => { setFaqPage(faqPage + 1); setFaqOpen(null) }}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </section>
          </div>
        </TabsContent>

        {/* ─── Onglet Confession de foi ─── */}
        <TabsContent value="beliefs" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche — Affiliation */}
            <section className="flex flex-col gap-4">
              <div>
                <h2 className="text-base font-semibold">Affiliation</h2>
                <p className="text-sm text-muted-foreground">Courant ou dénomination de votre église</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="denomination">Affiliation / courant</Label>
                <Input
                  id="denomination"
                  placeholder="Ex: Église évangélique, Baptiste, Assemblée de Dieu"
                  value={denomination}
                  onChange={(e) => setDenomination(e.target.value)}
                />
              </div>
            </section>

            {/* Colonne droite — Points de foi */}
            <section className="flex flex-col gap-4 min-h-[520px]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">Points de foi</h2>
                  <p className="text-sm text-muted-foreground">
                    {beliefs.length > 0 ? `${beliefs.length} point${beliefs.length > 1 ? 's' : ''}` : 'Ce en quoi nous croyons'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBeliefs([...beliefs, { title: '', content: '' }])
                    setBeliefsOpen(beliefs.length)
                  }}
                >
                  + Ajouter
                </Button>
              </div>

              {beliefs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground italic">
                    Aucun point de foi pour le moment
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col rounded-lg border divide-y overflow-y-auto">
                  {beliefs.map((item, index) => {
                    const isOpen = beliefsOpen === index
                    return (
                      <div key={item.id ?? index}>
                        <button
                          type="button"
                          className="flex items-center justify-between w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors"
                          onClick={() => setBeliefsOpen(isOpen ? null : index)}
                        >
                          <span className="font-medium truncate pr-2">
                            {item.title || `Point ${index + 1}`}
                          </span>
                          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 flex flex-col gap-3">
                            <Input
                              placeholder="Thème (ex: La Bible, Dieu, Le salut...)"
                              value={item.title}
                              onChange={(e) => {
                                const updated = [...beliefs]
                                updated[index] = { ...updated[index], title: e.target.value }
                                setBeliefs(updated)
                              }}
                            />
                            <div className="flex flex-col gap-2">
                              <Label>Énoncé</Label>
                              <Textarea
                                placeholder="Nous croyons que..."
                                rows={3}
                                value={item.content}
                                onChange={(e) => {
                                  const updated = [...beliefs]
                                  updated[index] = { ...updated[index], content: e.target.value }
                                  setBeliefs(updated)
                                }}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive self-end gap-1.5"
                              onClick={() => {
                                setBeliefs(beliefs.filter((_, i) => i !== index))
                                setBeliefsOpen(null)
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Supprimer
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions — sticky en bas */}
      <div className="sticky bottom-0 bg-background border-t py-4 -mx-1 px-1">
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}
