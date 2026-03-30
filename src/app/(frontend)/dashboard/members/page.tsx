import Link from 'next/link'
import { Plus, Upload, UsersRound, Crown, MailPlus, Mail, Clock, CheckCircle, XCircle } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { getThumbUrl } from '@/lib/image-utils'
import { CHURCH_ROLE_LABELS } from '@/lib/church-roles'
import { formatRelativeTime } from '@/lib/relative-time'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MembersList } from '@/components/features/members/members-list'
import { MembersTabs } from '@/components/features/members/members-tabs'
import { InviteForm } from '@/components/features/invitations/invite-form'
import { InvitationActions } from '@/components/features/invitations/invitation-actions'
import { GroupActions } from '@/components/features/groups/group-actions'
import type { SerializedMember } from '@/components/features/members/members-list'

const STATUS_CONFIG = {
  pending: { label: 'En attente', icon: Clock, className: 'bg-sunglow/20 text-sunglow-foreground border-sunglow/30' },
  accepted: { label: 'Acceptée', icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-200' },
  expired: { label: 'Expirée', icon: XCircle, className: 'bg-muted text-muted-foreground border-muted' },
} as const

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function MembersPage() {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const isAdmin = user.role === 'super-admin' || user.role === 'admin-church'

  // Fetch en parallèle
  const [membersResult, groupsResult, invitationsResult] = await Promise.all([
    payload.find({
      collection: 'members',
      where: { church: { equals: tenant.id } },
      sort: 'lastName',
      limit: 200,
      depth: 1,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'groups',
      where: { church: { equals: tenant.id } },
      sort: 'name',
      limit: 100,
      depth: 1,
      overrideAccess: false,
      user,
    }).catch(() => ({ docs: [] as any[] })),
    isAdmin
      ? payload.find({
          collection: 'invitations',
          where: { church: { equals: tenant.id } },
          sort: '-createdAt',
          limit: 100,
          depth: 1,
          overrideAccess: false,
          user,
        })
      : Promise.resolve({ docs: [] as any[] }),
  ])

  // Sérialiser les membres
  const serialized: SerializedMember[] = membersResult.docs.map((member) => {
    const linkedUser = member.user && typeof member.user === 'object'
      ? member.user as { id: number; role?: string; lastLogin?: string }
      : null
    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email ?? null,
      phone: member.phone ?? null,
      churchRole: member.churchRole ?? null,
      churchRoleLabel: member.churchRole ? (CHURCH_ROLE_LABELS[member.churchRole] || member.churchRole) : null,
      isActive: member.isActive !== false,
      photoUrl: getThumbUrl(member.photo),
      hasAccount: Boolean(member.user),
      isAdminMember: linkedUser?.role === 'admin-church' || linkedUser?.role === 'super-admin',
      lastLoginLabel: linkedUser?.lastLogin ? formatRelativeTime(linkedUser.lastLogin) : null,
    }
  })

  // Invitations avec expiration
  const now = new Date()
  const displayInvitations = invitationsResult.docs.map((inv: any) => {
    if (inv.status === 'pending' && new Date(inv.expiresAt) < now) {
      return { ...inv, status: 'expired' as const }
    }
    return inv
  })

  // --- Tab Annuaire ---
  const annuaireContent = (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex justify-end gap-2">
          <Link href="/dashboard/members/import">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Importer</span>
            </Button>
          </Link>
          <Link href="/dashboard/members/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ajouter</span>
            </Button>
          </Link>
        </div>
      )}
      <MembersList members={serialized} isAdmin={isAdmin} />
    </div>
  )

  // --- Tab Groupes ---
  const groups = groupsResult.docs
  const groupesContent = (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Link href="/dashboard/groups/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Créer un groupe</span>
            </Button>
          </Link>
        </div>
      )}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <UsersRound className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucun groupe</p>
          <p className="text-sm mt-1">
            Créez des groupes pour organiser vos membres par ministère ou activité.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group: any) => {
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

  // --- Tab Invitations ---
  const pending = displayInvitations.filter((inv: any) => inv.status === 'pending')
  const others = displayInvitations.filter((inv: any) => inv.status !== 'pending')

  const invitationsContent = (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <InviteForm churchId={tenant.id} />
      </div>
      {displayInvitations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <MailPlus className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucune invitation</p>
          <p className="text-sm mt-1">
            Invitez des membres pour qu&apos;ils rejoignent votre église sur Narthex.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {pending.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                En attente ({pending.length})
              </h2>
              <div className="flex flex-col gap-2">
                {pending.map((inv: any) => {
                  const status = inv.status as keyof typeof STATUS_CONFIG
                  const config = STATUS_CONFIG[status] || STATUS_CONFIG.expired
                  const StatusIcon = config.icon
                  const invitedByEmail = inv.invitedBy && typeof inv.invitedBy === 'object' ? inv.invitedBy.email : null
                  const displayName = [inv.firstName, inv.lastName].filter(Boolean).join(' ')
                  return (
                    <div key={inv.id} className="rounded-lg border border-raisin/8 bg-raisin/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-heading font-bold truncate">{inv.email}</p>
                            {displayName && <p className="text-sm text-muted-foreground">{displayName}</p>}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <Badge variant="outline" className={config.className}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {config.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {inv.role === 'admin-church' ? 'Admin' : 'Bénévole'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</span>
                            </div>
                            {invitedByEmail && <p className="text-xs text-muted-foreground mt-1">par {invitedByEmail}</p>}
                          </div>
                        </div>
                        <InvitationActions invitationId={inv.id} email={inv.email} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {others.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Historique ({others.length})
              </h2>
              <div className="flex flex-col gap-2">
                {others.map((inv: any) => {
                  const status = inv.status as keyof typeof STATUS_CONFIG
                  const config = STATUS_CONFIG[status] || STATUS_CONFIG.expired
                  const StatusIcon = config.icon
                  const displayName = [inv.firstName, inv.lastName].filter(Boolean).join(' ')
                  return (
                    <div key={inv.id} className="rounded-lg border border-raisin/8 bg-raisin/5 p-4 opacity-60">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-heading font-bold truncate">{inv.email}</p>
                          {displayName && <p className="text-sm text-muted-foreground">{displayName}</p>}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <Badge variant="outline" className={config.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Membres</h1>
      <MembersTabs
        isAdmin={isAdmin}
        annuaireContent={annuaireContent}
        groupesContent={groupesContent}
        invitationsContent={invitationsContent}
      />
    </div>
  )
}
