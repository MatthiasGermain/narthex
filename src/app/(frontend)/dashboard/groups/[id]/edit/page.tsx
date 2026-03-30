import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { GroupForm } from '@/components/features/groups/group-form'

export default async function EditGroupPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const groupId = Number(id)
  if (Number.isNaN(groupId)) notFound()

  const { payload, user, tenant } = await resolveTenant()
  if (!user || !tenant) notFound()

  if (user.role !== 'super-admin' && user.role !== 'admin-church') notFound()

  const group = await payload
    .findByID({
      collection: 'groups',
      id: groupId,
      depth: 1,
      overrideAccess: false,
      user,
    })
    .catch(() => null)

  if (!group) notFound()

  const groupChurchId =
    typeof group.church === 'object' ? (group.church as { id: number })?.id : group.church
  if (String(groupChurchId) !== String(tenant.id)) notFound()

  const { docs: members } = await payload.find({
    collection: 'members',
    where: {
      church: { equals: tenant.id },
      isActive: { equals: true },
    },
    sort: 'lastName',
    limit: 200,
    depth: 0,
    overrideAccess: false,
    user,
  })

  const availableMembers = members.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
  }))

  // Extraire les IDs des membres du groupe
  const groupMembers = (Array.isArray(group.members) ? group.members : [])
    .map((m) => (typeof m === 'object' ? (m as { id: number }).id : m as number))
    .filter(Boolean)

  const leaderId = group.leader
    ? typeof group.leader === 'object' ? (group.leader as { id: number }).id : group.leader as number
    : null

  const defaultValues = {
    id: group.id,
    name: group.name,
    description: group.description || '',
    members: groupMembers,
    leader: leaderId,
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/groups"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux groupes
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Modifier le groupe</h1>
      </div>

      <GroupForm
        mode="edit"
        churchId={tenant.id}
        availableMembers={availableMembers}
        defaultValues={defaultValues}
      />
    </div>
  )
}
