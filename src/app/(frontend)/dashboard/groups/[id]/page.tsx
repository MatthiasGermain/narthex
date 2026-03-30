import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Pencil, Crown } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const groupId = Number(id)
  if (Number.isNaN(groupId)) notFound()

  const { payload, user, tenant } = await resolveTenant()
  if (!user || !tenant) notFound()

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

  const isAdmin = user.role === 'super-admin' || user.role === 'admin-church'

  const members = (Array.isArray(group.members) ? group.members : []) as Array<{
    id: number
    firstName: string
    lastName: string
    photo?: { sizes?: { thumbnail?: { url?: string } }; url?: string } | number | null
  }>

  const leader = group.leader && typeof group.leader === 'object'
    ? group.leader as { id: number; firstName: string; lastName: string }
    : null

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <Link
          href="/dashboard/groups"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux groupes
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-muted-foreground mt-1">{group.description}</p>
          )}
          {leader && (
            <div className="flex items-center gap-1.5 mt-2">
              <Crown className="h-4 w-4 text-sunglow" />
              <span className="text-sm font-medium">
                {leader.firstName} {leader.lastName}
              </span>
            </div>
          )}
        </div>
        {isAdmin && (
          <Link href={`/dashboard/groups/${group.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-raisin/8 bg-raisin/5 p-5">
        <h2 className="font-heading font-bold text-lg mb-3">
          Membres ({members.length})
        </h2>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun membre dans ce groupe</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.map((member) => {
              const photo = member.photo && typeof member.photo === 'object'
                ? member.photo as { sizes?: { thumbnail?: { url?: string } }; url?: string }
                : null
              const thumbUrl = photo?.sizes?.thumbnail?.url || photo?.url || null
              const isLeader = leader && leader.id === member.id

              return (
                <Link key={member.id} href={`/dashboard/members/${member.id}`}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt={`${member.firstName} ${member.lastName}`}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {getInitials(member.firstName, member.lastName)}
                      </div>
                    )}
                    <span className="text-sm font-medium truncate">
                      {member.firstName} {member.lastName}
                    </span>
                    {isLeader && (
                      <Badge variant="outline" className="text-xs ml-auto shrink-0">
                        <Crown className="h-3 w-3 mr-0.5" />
                        Responsable
                      </Badge>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
