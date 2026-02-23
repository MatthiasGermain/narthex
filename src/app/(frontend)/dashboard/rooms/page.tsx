import Link from 'next/link'
import Image from 'next/image'
import { DoorOpen, Plus, Users, Accessibility, Wifi, Music, Monitor, UtensilsCrossed, Presentation } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RoomActions } from '@/components/features/rooms/room-actions'

const EQUIPMENT_LABELS: Record<string, { label: string; icon: typeof Wifi }> = {
  projector: { label: 'Vidéoprojecteur', icon: Presentation },
  sound: { label: 'Sono', icon: Music },
  piano: { label: 'Piano', icon: Music },
  wifi: { label: 'Wi-Fi', icon: Wifi },
  kitchen: { label: 'Cuisine', icon: UtensilsCrossed },
  board: { label: 'Tableau', icon: Monitor },
}

function getThumbUrl(image: unknown): string | null {
  if (!image || typeof image !== 'object') return null
  const img = image as { url?: string; sizes?: { thumbnail?: { url?: string } } }
  return img.sizes?.thumbnail?.url || img.url || null
}

function canUserDelete(
  room: { createdBy?: number | { id: number } | null },
  userId: number,
  userRole: string,
): boolean {
  if (userRole === 'super-admin' || userRole === 'admin-church') return true
  const creatorId = typeof room.createdBy === 'object' ? room.createdBy?.id : room.createdBy
  return creatorId === userId
}

export default async function RoomsPage() {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const { docs: rooms } = await payload.find({
    collection: 'rooms',
    where: {
      church: { equals: tenant.id },
    },
    sort: 'name',
    limit: 100,
    depth: 1,
    overrideAccess: false,
    user,
  })

  const active = rooms.filter((r) => r.isActive !== false)
  const inactive = rooms.filter((r) => r.isActive === false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Salles</h1>
        <Link href="/dashboard/rooms/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ajouter</span>
          </Button>
        </Link>
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <DoorOpen className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucune salle</p>
          <p className="text-sm mt-1">Ajoutez votre première salle pour commencer.</p>
          <Link href="/dashboard/rooms/new" className="mt-4">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une salle
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {active.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Disponibles ({active.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map((room) => (
                  <div
                    key={room.id}
                    className="rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {getThumbUrl(room.image) ? (
                      <Image
                        src={getThumbUrl(room.image)!}
                        alt={room.name}
                        width={400}
                        height={200}
                        className="w-full h-36 object-cover"
                      />
                    ) : (
                      <div className="w-full h-36 bg-muted flex items-center justify-center">
                        <DoorOpen className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-heading font-bold truncate">{room.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            {room.capacity && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {room.capacity}
                              </span>
                            )}
                            {room.floor && <span>{room.floor}</span>}
                            {room.accessibility && (
                              <Accessibility className="h-3.5 w-3.5 text-primary" />
                            )}
                          </div>
                        </div>
                        <RoomActions
                          roomId={room.id}
                          roomName={room.name}
                          canDelete={canUserDelete(room, user.id, user.role)}
                        />
                      </div>
                      {room.equipment && room.equipment.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {room.equipment.map((eq) => (
                            <Badge key={eq} variant="outline" className="text-xs">
                              {EQUIPMENT_LABELS[eq]?.label || eq}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inactive.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Indisponibles ({inactive.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactive.map((room) => (
                  <div
                    key={room.id}
                    className="rounded-lg border overflow-hidden opacity-60"
                  >
                    <div className="w-full h-24 bg-muted flex items-center justify-center">
                      <DoorOpen className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-heading font-bold truncate">{room.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            {room.capacity && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {room.capacity}
                              </span>
                            )}
                            {room.floor && <span>{room.floor}</span>}
                          </div>
                        </div>
                        <RoomActions
                          roomId={room.id}
                          roomName={room.name}
                          canDelete={canUserDelete(room, user.id, user.role)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
