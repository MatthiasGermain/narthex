import Link from 'next/link'
import Image from 'next/image'
import { Users, Plus, Mail, Phone, UserCheck } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { getThumbUrl } from '@/lib/image-utils'
import { CHURCH_ROLE_LABELS } from '@/lib/church-roles'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MemberActions } from '@/components/features/members/member-actions'

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export default async function MembersPage() {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const isAdmin = user.role === 'super-admin' || user.role === 'admin-church'

  const { docs: members } = await payload.find({
    collection: 'members',
    where: {
      church: { equals: tenant.id },
    },
    sort: 'lastName',
    limit: 200,
    depth: 1,
    overrideAccess: false,
    user,
  })

  const active = members.filter((m) => m.isActive !== false)
  const inactive = members.filter((m) => m.isActive === false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Membres</h1>
        {isAdmin && (
          <Link href="/dashboard/members/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ajouter</span>
            </Button>
          </Link>
        )}
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Users className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucun membre</p>
          <p className="text-sm mt-1">Ajoutez votre premier membre pour commencer l&apos;annuaire.</p>
          {isAdmin && (
            <Link href="/dashboard/members/new" className="mt-4">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un membre
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {active.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Actifs ({active.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map((member) => {
                  const thumbUrl = getThumbUrl(member.photo)
                  const hasAccount = Boolean(member.user)
                  return (
                    <div
                      key={member.id}
                      className="rounded-lg border border-raisin/8 bg-raisin/5 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          {thumbUrl ? (
                            <Image
                              src={thumbUrl}
                              alt={`${member.firstName} ${member.lastName}`}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                              {getInitials(member.firstName, member.lastName)}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-heading font-bold truncate">
                                {member.firstName} {member.lastName}
                              </p>
                              {hasAccount && (
                                <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" aria-label="Compte lié" />
                              )}
                            </div>
                            {member.churchRole && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {CHURCH_ROLE_LABELS[member.churchRole] || member.churchRole}
                              </Badge>
                            )}
                          </div>

                          {isAdmin && (
                            <MemberActions
                              memberId={member.id}
                              memberName={`${member.firstName} ${member.lastName}`}
                              canDelete={isAdmin}
                            />
                          )}
                        </div>

                        <div className="flex flex-col gap-1 mt-3 text-sm text-muted-foreground">
                          {member.email && (
                            <span className="flex items-center gap-1.5 truncate">
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              {member.email}
                            </span>
                          )}
                          {member.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              {member.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {inactive.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Inactifs ({inactive.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactive.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-lg border border-raisin/8 bg-raisin/5 overflow-hidden opacity-60"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground shrink-0">
                          {getInitials(member.firstName, member.lastName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-heading font-bold truncate">
                            {member.firstName} {member.lastName}
                          </p>
                          {member.churchRole && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {CHURCH_ROLE_LABELS[member.churchRole] || member.churchRole}
                            </Badge>
                          )}
                        </div>
                        {isAdmin && (
                          <MemberActions
                            memberId={member.id}
                            memberName={`${member.firstName} ${member.lastName}`}
                            canDelete={isAdmin}
                          />
                        )}
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
