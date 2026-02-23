import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { RoomForm } from '@/components/features/rooms/room-form'

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const roomId = Number(id)
  if (Number.isNaN(roomId)) notFound()

  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) notFound()

  const room = await payload.findByID({
    collection: 'rooms',
    id: roomId,
    depth: 1,
    overrideAccess: false,
    user,
  }).catch(() => null)

  if (!room) notFound()

  const roomChurchId = typeof room.church === 'object' ? room.church?.id : room.church
  if (String(roomChurchId) !== String(tenant.id)) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/rooms"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux salles
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Modifier la salle</h1>
      </div>

      <RoomForm
        mode="edit"
        churchId={tenant.id}
        defaultValues={{
          id: room.id,
          name: room.name,
          capacity: room.capacity ?? null,
          floor: room.floor ?? '',
          description: room.description ?? '',
          equipment: (room.equipment as string[]) ?? [],
          accessibility: room.accessibility ?? false,
          isActive: room.isActive ?? true,
          image: room.image as number | { id: number; url?: string; sizes?: { thumbnail?: { url?: string } } } | null,
        }}
      />
    </div>
  )
}
