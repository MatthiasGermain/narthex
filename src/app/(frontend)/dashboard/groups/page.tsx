import Link from 'next/link'
import { UsersRound, Plus, Crown } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { isAdminRole } from '@/access'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GroupActions } from '@/components/features/groups/group-actions'

export default async function GroupsPage() {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const isAdmin = isAdminRole(user)

  const { docs: groups } = await payload.find({
    collection: 'groups',
    where: { church: { equals: tenant.id } },
    sort: 'name',
    limit: 100,
    depth: 1,
    overrideAccess: false,
    user,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Groupes</h1>
        {isAdmin && (
          <Link href="/dashboard/groups/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Créer</span>
            </Button>
          </Link>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <UsersRound className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucun groupe</p>
          <p className="text-sm mt-1">
            Créez des groupes pour organiser vos membres par ministère ou activité.
          </p>
          {isAdmin && (
            <Link href="/dashboard/groups/new" className="mt-4">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Créer un groupe
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const members = Array.isArray(group.members) ? group.members : []
            const memberCount = members.length
            const leader = group.leader && typeof group.leader === 'object'
              ? group.leader as { id: number; firstName: string; lastName: string }
              : null

            return (
              <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
                <div className="rounded-lg border border-raisin/8 bg-raisin/5 p-4 hover:shadow-md transition-shadow h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-bold truncate">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {group.description}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <GroupActions
                        groupId={group.id}
                        groupName={group.name}
                        canDelete={isAdmin}
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      <UsersRound className="h-3 w-3 mr-1" />
                      {memberCount} membre{memberCount !== 1 ? 's' : ''}
                    </Badge>
                    {leader && (
                      <Badge variant="outline" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        {leader.firstName} {leader.lastName}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
