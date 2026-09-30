import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { resolveTenant } from '@/lib/tenant'
import { CHURCH_ROLE_LABELS } from '@/lib/church-roles'
import { AccountProfileForm } from '@/components/features/account/account-profile-form'

function getPhotoData(photo: unknown): { id: number | null; url: string | null } {
  if (!photo) return { id: null, url: null }
  if (typeof photo === 'number') return { id: photo, url: null }
  const p = photo as { id: number; url?: string; sizes?: { thumbnail?: { url?: string } } }
  return {
    id: p.id,
    url: p.sizes?.thumbnail?.url || p.url || null,
  }
}

export default async function AccountPage() {
  const { user, tenant } = await resolveTenant()

  if (!tenant || !user) notFound()

  const payload = await getPayload({ config })

  const memberResult = await payload.find({
    collection: 'members',
    where: {
      user: { equals: user.id },
      church: { equals: tenant.id },
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  const member = memberResult.docs[0]

  if (!member) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <div className="rounded-lg border border-raisin/8 border-dashed bg-raisin/5 p-8 text-center text-sm text-muted-foreground">
          Aucun profil membre associé à votre compte. Contactez un administrateur.
        </div>
      </div>
    )
  }

  const photoData = getPhotoData(member.photo)

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      <section className="rounded-lg border border-raisin/8 bg-raisin/5 overflow-hidden">
        <div className="p-5">
          <AccountProfileForm
            memberId={member.id}
            churchId={tenant.id}
            defaultValues={{
              firstName: member.firstName,
              lastName: member.lastName,
              email: user.email,
              phone: member.phone,
              birthDate: member.birthDate,
              churchRole: member.churchRole,
              photoUrl: photoData.url,
              photoId: photoData.id,
            }}
            churchRoleLabel={member.churchRole ? CHURCH_ROLE_LABELS[member.churchRole] : undefined}
          />
        </div>
      </section>
    </div>
  )
}
