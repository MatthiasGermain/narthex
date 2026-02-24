import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { MemberForm } from '@/components/features/members/member-form'

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const memberId = Number(id)
  if (Number.isNaN(memberId)) notFound()

  const { payload, user, tenant } = await resolveTenant()
  if (!user) return null
  if (!tenant) notFound()

  // Seuls les admins peuvent modifier des membres
  if (user.role !== 'super-admin' && user.role !== 'admin-church') {
    notFound()
  }

  const member = await payload
    .findByID({
      collection: 'members',
      id: memberId,
      depth: 1,
      overrideAccess: false,
      user,
    })
    .catch(() => null)

  if (!member) notFound()

  const memberChurchId =
    typeof member.church === 'object' ? (member.church as { id: number })?.id : member.church
  if (String(memberChurchId) !== String(tenant.id)) notFound()

  const defaultValues = {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email ?? '',
    phone: member.phone ?? '',
    churchRole: member.churchRole ?? 'membre',
    birthDate: member.birthDate
      ? new Date(member.birthDate).toISOString().split('T')[0]
      : '',
    isActive: member.isActive ?? true,
    photo: member.photo as
      | number
      | { id: number; url?: string; sizes?: { thumbnail?: { url?: string } } }
      | null,
    user: member.user as number | { id: number; email?: string } | null,
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/members"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux membres
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Modifier le membre</h1>
      </div>

      <MemberForm
        mode="edit"
        churchId={tenant.id}
        userRole={user.role}
        defaultValues={defaultValues}
      />
    </div>
  )
}
