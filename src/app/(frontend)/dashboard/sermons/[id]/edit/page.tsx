import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { SermonForm } from '@/components/features/sermons/sermon-form'

export default async function EditSermonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const sermonId = Number(id)
  if (Number.isNaN(sermonId)) notFound()

  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) notFound()

  const [sermon, { docs: memberDocs }] = await Promise.all([
    payload.findByID({
      collection: 'sermons',
      id: sermonId,
      depth: 1,
      overrideAccess: false,
      user,
    }).catch(() => null),
    payload.find({
      collection: 'members',
      where: { church: { equals: tenant.id }, isActive: { equals: true } },
      sort: 'lastName',
      limit: 200,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  if (!sermon) notFound()

  const sermonChurchId = typeof sermon.church === 'object' ? sermon.church?.id : sermon.church
  if (String(sermonChurchId) !== String(tenant.id)) notFound()

  const dateValue = sermon.date ? new Date(sermon.date).toISOString().split('T')[0] : ''
  const members = memberDocs.map((m) => ({ id: m.id, firstName: m.firstName, lastName: m.lastName }))
  const preacherId = typeof sermon.preacher === 'object'
    ? (sermon.preacher as { id: number } | null)?.id ?? null
    : (sermon.preacher as number | null | undefined) ?? null

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
        <h1 className="text-2xl sm:text-3xl font-bold">Modifier la prédication</h1>
      </div>

      <SermonForm
        mode="edit"
        churchId={tenant.id}
        members={members}
        defaultValues={{
          id: sermon.id,
          title: sermon.title,
          date: dateValue,
          preacher: preacherId,
          series: sermon.series ?? '',
          scripture: sermon.scripture ?? '',
          description: sermon.description ?? '',
          audioFile: sermon.audioFile as number | { id: number; url?: string; filename?: string } | null,
          videoUrl: sermon.videoUrl ?? '',
          image: sermon.image as number | { id: number; url?: string; sizes?: { thumbnail?: { url?: string } }; alt?: string } | null,
          visibility: sermon.visibility as 'public' | 'internal',
        }}
      />
    </div>
  )
}
