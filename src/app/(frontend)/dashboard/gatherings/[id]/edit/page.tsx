import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { GatheringForm } from '@/components/features/gatherings/gathering-form'

/** Extrait la partie YYYY-MM-DD d'une date Payload, pour un <input type="date">. */
function toDateInput(value: string | null | undefined): string {
  return value ? new Date(value).toISOString().split('T')[0] : ''
}

export default async function EditGatheringPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const gatheringId = Number(id)
  if (Number.isNaN(gatheringId)) notFound()

  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) notFound()

  if (user.role !== 'super-admin' && user.role !== 'admin-church') {
    notFound()
  }

  const gathering = await payload
    .findByID({
      collection: 'gatherings',
      id: gatheringId,
      depth: 0,
      overrideAccess: false,
      user,
    })
    .catch(() => null)

  if (!gathering) notFound()

  const gatheringChurchId =
    typeof gathering.church === 'object' ? gathering.church?.id : gathering.church
  if (String(gatheringChurchId) !== String(tenant.id)) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/dashboard/gatherings/${gathering.id}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au rassemblement
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {`Modifier « ${gathering.title} »`}
        </h1>
      </div>

      <GatheringForm
        mode="edit"
        churchId={tenant.id}
        defaultValues={{
          id: gathering.id,
          title: gathering.title,
          startDate: toDateInput(gathering.startDate),
          endDate: toDateInput(gathering.endDate),
          location: gathering.location ?? '',
          description: gathering.description ?? '',
        }}
      />
    </div>
  )
}
