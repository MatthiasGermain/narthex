import { notFound } from 'next/navigation'

import { resolveTenant } from '@/lib/tenant'
import { ChurchProfileForm } from '@/components/features/church/church-profile-form'

export default async function DashboardProfilePage() {
  const { user, tenant, profile } = await resolveTenant()

  if (!tenant || !user) notFound()

  // Seuls les admins peuvent modifier le profil
  if (user.role === 'volunteer') notFound()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Profil de l&apos;église</h1>
        <p className="text-muted-foreground mt-1">
          Informations publiques visibles sur la page « À propos »
        </p>
      </div>
      <ChurchProfileForm
        mode={profile ? 'edit' : 'create'}
        profileId={profile?.id}
        tenantId={tenant.id}
        defaultValues={
          profile
            ? {
                description: profile.description ?? undefined,
                address: {
                  street: profile.address?.street ?? undefined,
                  postalCode: profile.address?.postalCode ?? undefined,
                  city: profile.address?.city ?? undefined,
                },
                contact: {
                  email: profile.contact?.email ?? undefined,
                  phone: profile.contact?.phone ?? undefined,
                  website: profile.contact?.website ?? undefined,
                },
                visitInfo: {
                  duration: profile.visitInfo?.duration ?? undefined,
                  serviceFlow: profile.visitInfo?.serviceFlow ?? undefined,
                  childrenInfo: profile.visitInfo?.childrenInfo ?? undefined,
                  parking: profile.visitInfo?.parking ?? undefined,
                },
                faq: (profile.faq as { question: string; answer: string; id?: string }[])?.map(f => ({
                  question: f.question,
                  answer: f.answer,
                  id: f.id,
                })),
                denomination: profile.denomination ?? undefined,
                beliefs: (profile.beliefs as { title: string; content: string; id?: string }[])?.map(b => ({
                  title: b.title,
                  content: b.content,
                  id: b.id,
                })),
                social: {
                  facebook: profile.social?.facebook ?? undefined,
                  instagram: profile.social?.instagram ?? undefined,
                  youtube: profile.social?.youtube ?? undefined,
                },
              }
            : undefined
        }
      />
    </div>
  )
}
