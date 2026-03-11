import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { SermonForm } from '@/components/features/sermons/sermon-form'

export default async function NewSermonPage() {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const { docs: memberDocs } = await payload.find({
    collection: 'members',
    where: { church: { equals: tenant.id }, isActive: { equals: true } },
    sort: 'lastName',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  const members = memberDocs.map((m) => ({ id: m.id, firstName: m.firstName, lastName: m.lastName }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/sermons"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux prédications
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Nouvelle prédication</h1>
      </div>

      <SermonForm mode="create" churchId={tenant.id} members={members} />
    </div>
  )
}
