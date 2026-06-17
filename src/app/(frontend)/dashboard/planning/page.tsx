import Link from 'next/link'
import { Plus, ClipboardList } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlanActions } from '@/components/features/planning/plan-actions'
import {
  BulkSelectProvider,
  BulkCheckbox,
  BulkSelectAll,
  BulkActionBar,
} from '@/components/features/bulk-select'

function isPast(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr) < today
}

type MemberDoc = { id: number; firstName: string; lastName: string }
type GroupDoc = { id: number; name: string; leader?: MemberDoc | number | null }
type Assignment = {
  role: string
  members: MemberDoc[] | number[] | null
  group?: GroupDoc | number | null
}
type ViewMode = 'compact' | 'detailed'

function isFilled(a: Assignment): boolean {
  return (Array.isArray(a.members) && a.members.length > 0) || a.group != null
}

function summarizeAssignments(assignments: Assignment[] | undefined): string {
  if (!assignments || assignments.length === 0) return '—'
  const filled = assignments.filter(isFilled).length
  return `${filled} / ${assignments.length} rôles assignés`
}

function getAssignmentDetails(assignments: Assignment[] | undefined) {
  return (assignments ?? []).map((a) => {
    const group = a.group && typeof a.group === 'object' ? a.group : null
    const leader = group?.leader && typeof group.leader === 'object' ? group.leader : null
    const names = Array.isArray(a.members)
      ? a.members
          .filter((m): m is MemberDoc => typeof m === 'object' && m !== null)
          .map((m) => `${m.firstName} ${m.lastName}`)
      : []
    const groupLabel = group
      ? `${group.name} (groupe${leader ? ` · ${leader.firstName} ${leader.lastName}` : ''})`
      : null
    return { role: a.role, names, groupLabel }
  })
}

/** Rendu des affectations selon la vue choisie (compact = résumé, détaillé = rôle → personnes). */
function Assignments({ assignments, view }: { assignments: Assignment[] | undefined; view: ViewMode }) {
  if (view !== 'detailed') {
    return <span className="text-sm text-muted-foreground">{summarizeAssignments(assignments)}</span>
  }
  const details = getAssignmentDetails(assignments)
  if (details.length === 0) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <div className="flex flex-col gap-0.5">
      {details.map((d, i) => {
        const parts = [d.groupLabel, ...d.names].filter(Boolean) as string[]
        return (
          <div key={i} className="flex flex-wrap gap-x-1.5 text-sm">
            <span className="font-medium text-foreground">{d.role} :</span>
            <span
              className={parts.length ? 'text-muted-foreground' : 'italic text-muted-foreground/50'}
            >
              {parts.length ? parts.join(', ') : 'non assigné'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface Props {
  searchParams: Promise<{ view?: string }>
}

export default async function PlanningPage({ searchParams }: Props) {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const { view: viewParam } = await searchParams
  const view: ViewMode = viewParam === 'detailed' ? 'detailed' : 'compact'

  const isAdmin = user.role === 'super-admin' || user.role === 'admin-church'

  const { docs: plans } = await payload.find({
    collection: 'service-plans',
    where: {
      church: { equals: tenant.id },
    },
    sort: 'date',
    limit: 50,
    depth: 2,
    overrideAccess: false,
    user,
  })

  // À venir : du plus proche au plus lointain (croissant).
  // Passés : du plus récent au plus ancien (décroissant).
  const upcoming = plans.filter((p) => !isPast(p.date))
  const past = plans.filter((p) => isPast(p.date)).reverse()
  const upcomingIds = upcoming.map((p) => p.id)
  const pastIds = past.map((p) => p.id)

  return (
    <BulkSelectProvider>
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Cultes</h1>
        <div className="flex items-center gap-2">
          {plans.length > 0 && (
            <div className="inline-flex rounded-lg border border-raisin/10 p-0.5 text-sm">
              <Link
                href="/dashboard/planning"
                className={cn(
                  'rounded-md px-3 py-1 transition-colors',
                  view === 'compact' ? 'bg-raisin/10 font-medium' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Compact
              </Link>
              <Link
                href="/dashboard/planning?view=detailed"
                className={cn(
                  'rounded-md px-3 py-1 transition-colors',
                  view === 'detailed' ? 'bg-raisin/10 font-medium' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Détaillé
              </Link>
            </div>
          )}
          {isAdmin && (
            <Link href="/dashboard/planning/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nouveau culte</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <ClipboardList className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Aucun culte</p>
          <p className="text-sm mt-1">Créez votre premier culte pour commencer.</p>
          {isAdmin && (
            <Link href="/dashboard/planning/new" className="mt-4">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Créer un culte
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="flex flex-col gap-6 sm:hidden">
            {upcoming.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  À venir
                </h2>
                {upcoming.map((plan) => (
                  <div
                    key={plan.id}
                    className="relative flex items-start justify-between gap-3 rounded-lg border border-raisin/8 bg-raisin/5 p-4"
                  >
                    <Link
                      href={`/dashboard/planning/${plan.id}/edit`}
                      className="absolute inset-0"
                      aria-label={`Ouvrir le culte du ${formatDate(plan.date)}`}
                    />
                    {isAdmin && (
                      <div className="relative z-10 pt-0.5">
                        <BulkCheckbox id={plan.id} label={`Sélectionner le culte du ${formatDate(plan.date)}`} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{formatDate(plan.date)}</p>
                      <div className="mt-1">
                        <Assignments assignments={plan.assignments as Assignment[]} view={view} />
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="relative z-10">
                        <PlanActions
                          planId={plan.id}
                          planLabel={formatDate(plan.date)}
                          canDelete={isAdmin}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {past.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Passés
                </h2>
                {past.map((plan) => (
                  <div
                    key={plan.id}
                    className="relative flex items-start justify-between gap-3 rounded-lg border border-raisin/8 bg-raisin/5 p-4 opacity-60"
                  >
                    <Link
                      href={`/dashboard/planning/${plan.id}/edit`}
                      className="absolute inset-0"
                      aria-label={`Ouvrir le culte du ${formatDate(plan.date)}`}
                    />
                    {isAdmin && (
                      <div className="relative z-10 pt-0.5">
                        <BulkCheckbox id={plan.id} label={`Sélectionner le culte du ${formatDate(plan.date)}`} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{formatDate(plan.date)}</p>
                      <div className="mt-1">
                        <Assignments assignments={plan.assignments as Assignment[]} view={view} />
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="relative z-10">
                        <PlanActions
                          planId={plan.id}
                          planLabel={formatDate(plan.date)}
                          canDelete={isAdmin}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:flex sm:flex-col sm:gap-6">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  À venir
                </h2>
                <div className="rounded-lg border border-raisin/8 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-raisin/8">
                        {isAdmin && (
                          <TableHead className="w-10">
                            <BulkSelectAll ids={upcomingIds} label="Tout sélectionner (à venir)" />
                          </TableHead>
                        )}
                        <TableHead className="w-[35%]">Date</TableHead>
                        <TableHead className="w-[45%]">Affectations</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcoming.map((plan) => (
                        <TableRow key={plan.id} className="relative cursor-pointer hover:bg-raisin/5">
                          {isAdmin && (
                            <TableCell className="relative z-10 w-px align-top">
                              <BulkCheckbox id={plan.id} label={`Sélectionner le culte du ${formatDate(plan.date)}`} />
                            </TableCell>
                          )}
                          <TableCell className="align-top font-medium whitespace-nowrap">
                            <Link
                              href={`/dashboard/planning/${plan.id}/edit`}
                              className="absolute inset-0"
                              aria-label={`Ouvrir le culte du ${formatDate(plan.date)}`}
                            />
                            {formatDate(plan.date)}
                          </TableCell>
                          <TableCell className="align-top whitespace-normal">
                            <Assignments assignments={plan.assignments as Assignment[]} view={view} />
                          </TableCell>
                          <TableCell className="relative z-10 w-px align-top">
                            {isAdmin && (
                              <PlanActions
                                planId={plan.id}
                                planLabel={formatDate(plan.date)}
                                canDelete={isAdmin}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Passés
                </h2>
                <div className="rounded-lg border border-raisin/8 overflow-hidden opacity-60">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-raisin/8">
                        {isAdmin && (
                          <TableHead className="w-10">
                            <BulkSelectAll ids={pastIds} label="Tout sélectionner (passés)" />
                          </TableHead>
                        )}
                        <TableHead className="w-[35%]">Date</TableHead>
                        <TableHead className="w-[45%]">Affectations</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {past.map((plan) => (
                        <TableRow key={plan.id} className="relative cursor-pointer hover:bg-raisin/5">
                          {isAdmin && (
                            <TableCell className="relative z-10 w-px align-top">
                              <BulkCheckbox id={plan.id} label={`Sélectionner le culte du ${formatDate(plan.date)}`} />
                            </TableCell>
                          )}
                          <TableCell className="align-top font-medium whitespace-nowrap">
                            <Link
                              href={`/dashboard/planning/${plan.id}/edit`}
                              className="absolute inset-0"
                              aria-label={`Ouvrir le culte du ${formatDate(plan.date)}`}
                            />
                            {formatDate(plan.date)}
                          </TableCell>
                          <TableCell className="align-top whitespace-normal">
                            <Assignments assignments={plan.assignments as Assignment[]} view={view} />
                          </TableCell>
                          <TableCell className="relative z-10 w-px align-top">
                            {isAdmin && (
                              <PlanActions
                                planId={plan.id}
                                planLabel={formatDate(plan.date)}
                                canDelete={isAdmin}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
    {isAdmin && <BulkActionBar collection="service-plans" noun={{ one: 'culte', many: 'cultes' }} />}
    </BulkSelectProvider>
  )
}
