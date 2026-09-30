import { MailPlus, Mail, Clock, CheckCircle, XCircle } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { PAGE_SIZE, UPCOMING_LIMIT, parsePage, type SearchParams } from '@/lib/pagination'
import { Pagination } from '@/components/features/pagination'
import { isAdminRole } from '@/access'
import { formatDateNumeric } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { InviteForm } from '@/components/features/invitations/invite-form'
import { InvitationActions } from '@/components/features/invitations/invitation-actions'

const STATUS_CONFIG = {
  pending: { label: 'En attente', icon: Clock, className: 'bg-sunglow/20 text-sunglow-foreground border-sunglow/30' },
  accepted: { label: 'Acceptée', icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-200' },
  expired: { label: 'Expirée', icon: XCircle, className: 'bg-muted text-muted-foreground border-muted' },
} as const

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const isAdmin = isAdminRole(user)
  if (!isAdmin) return null

  const params = await searchParams
  const page = parsePage(params.page)

  // Les invitations en attente sont peu nombreuses par nature ; c'est
  // l'historique des acceptées et expirées qui s'accumule.
  const [pendingResult, othersResult] = await Promise.all([
    payload.find({
      collection: 'invitations',
      where: { church: { equals: tenant.id }, status: { equals: 'pending' } },
      sort: '-createdAt',
      limit: UPCOMING_LIMIT,
      depth: 1,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'invitations',
      where: { church: { equals: tenant.id }, status: { not_equals: 'pending' } },
      sort: '-createdAt',
      limit: PAGE_SIZE,
      page,
      depth: 1,
      overrideAccess: false,
      user,
    }),
  ])

  // Une invitation encore « en attente » mais dont la date est passée s'affiche
  // comme expirée, et rejoint donc l'historique.
  const now = new Date()
  const relabelled = pendingResult.docs.map((inv) =>
    new Date(inv.expiresAt) < now ? { ...inv, status: 'expired' as const } : inv,
  )

  const pending = relabelled.filter((inv) => inv.status === 'pending')
  const others = [...relabelled.filter((inv) => inv.status !== 'pending'), ...othersResult.docs]
  const displayInvitations = [...pending, ...others]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Invitations</h1>
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
                {pending.map((inv) => (
                  <InvitationCard key={inv.id} invitation={inv} />
                ))}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Historique ({othersResult.totalDocs})
              </h2>
              <div className="flex flex-col gap-2">
                {others.map((inv) => (
                  <InvitationCard key={inv.id} invitation={inv} />
                ))}
              </div>

              <Pagination
                basePath="/dashboard/invitations"
                searchParams={params}
                page={page}
                totalPages={othersResult.totalPages}
                label="de l'historique des invitations"
                className="pt-2"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InvitationCard({ invitation }: { invitation: {
  id: number
  email: string
  status: string
  firstName?: string | null
  lastName?: string | null
  role: string
  createdAt: string
  expiresAt: string
  invitedBy?: number | { id: number; email?: string } | null
} }) {
  const status = invitation.status as keyof typeof STATUS_CONFIG
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.expired
  const StatusIcon = config.icon

  const invitedByEmail = invitation.invitedBy && typeof invitation.invitedBy === 'object'
    ? invitation.invitedBy.email
    : null

  const displayName = [invitation.firstName, invitation.lastName].filter(Boolean).join(' ')

  return (
    <div className="rounded-lg border border-raisin/8 bg-raisin/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-heading font-bold truncate">{invitation.email}</p>
            {displayName && (
              <p className="text-sm text-muted-foreground">{displayName}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <Badge variant="outline" className={config.className}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {invitation.role === 'admin-church' ? 'Admin' : 'Bénévole'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDateNumeric(invitation.createdAt)}
              </span>
            </div>
            {invitedByEmail && (
              <p className="text-xs text-muted-foreground mt-1">
                par {invitedByEmail}
              </p>
            )}
          </div>
        </div>

        {status === 'pending' && (
          <InvitationActions
            invitationId={invitation.id}
            email={invitation.email}
          />
        )}
      </div>
    </div>
  )
}
