import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { GroupForm } from '@/components/features/groups/group-form'

export default async function NewGroupPage() {
  const { payload, user, tenant } = await resolveTenant()
  if (!user || !tenant) return null

  if (user.role !== 'super-admin' && user.role !== 'admin-church') notFound()

  const { docs: members } = await payload.find({
    collection: 'members',
    where: {
      church: { equals: tenant.id },
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
        <h1 className="text-2xl sm:text-3xl font-bold">Nouveau groupe</h1>
      </div>

      <GroupForm
        mode="create"
        churchId={tenant.id}
        availableMembers={availableMembers}
      />
    </div>
  )
}
