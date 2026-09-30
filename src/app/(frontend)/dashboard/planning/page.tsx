import Link from 'next/link'
import { Plus, ClipboardList } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { isAdminRole } from '@/access'
import { formatDate } from '@/lib/format'
import { getTodayISO } from '@/lib/date-utils'
import { PAGE_SIZE, UPCOMING_LIMIT, parsePage, type SearchParams } from '@/lib/pagination'
import { Pagination } from '@/components/features/pagination'
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
import { PlanningShare } from '@/components/features/planning/planning-share'
import { Assignments, type Assignment, type ViewMode } from '@/components/features/planning/assignments'
import {
  BulkSelectProvider,
  BulkCheckbox,
  BulkSelectAll,
  BulkActionBar,
} from '@/components/features/bulk-select'

interface Props {
  searchParams: Promise<SearchParams>
}

/** Formulation pour lecteurs d'écran : « Ouvrir / Sélectionner … ». */
function planLabelOf(plan: { title?: string | null; date: string }): string {
  const name = plan.title?.trim()
  return name ? `${name}, le ${formatDate(plan.date)}` : `le culte du ${formatDate(plan.date)}`
}

/** Nom seul, pour les phrases qui l'encadrent déjà (dialogue de suppression). */
function planNameOf(plan: { title?: string | null; date: string }): string {
  return plan.title?.trim() || formatDate(plan.date)
}

export default async function PlanningPage({ searchParams }: Props) {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const params = await searchParams
  const view: ViewMode = params.view === 'detailed' ? 'detailed' : 'compact'
  const pastPage = parsePage(params.passes)
  const today = getTodayISO()

  const isAdmin = isAdminRole(user)
  const shareToken =
    (tenant as { planningShareToken?: string | null }).planningShareToken ?? null

  // Les cultes à venir tiennent en une page ; seule l'archive grandit
  // indéfiniment, c'est donc elle qui est paginée.
  const [upcomingResult, pastResult] = await Promise.all([
    payload.find({
      collection: 'service-plans',
      where: { church: { equals: tenant.id }, date: { greater_than_equal: today } },
      sort: '-date',
      limit: UPCOMING_LIMIT,
      depth: 2,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'service-plans',
      where: { church: { equals: tenant.id }, date: { less_than: today } },
      sort: '-date',
      limit: PAGE_SIZE,
      page: pastPage,
      depth: 2,
      overrideAccess: false,
      user,
    }),
  ])

  // Du jour le plus récent au plus ancien ; un même jour, dans l'ordre de la
  // journée (10h avant 14h). Sans heure : en fin de journée.
  const dayOf = (iso: string) => iso.slice(0, 10)
  const byDayThenTime = (a: { date: string; time?: string | null }, b: { date: string; time?: string | null }) =>
    dayOf(b.date).localeCompare(dayOf(a.date)) ||
    (a.time || '99:99').localeCompare(b.time || '99:99')

  const upcoming = [...upcomingResult.docs].sort(byDayThenTime)
  const past = [...pastResult.docs].sort(byDayThenTime)
  const upcomingIds = upcoming.map((p) => p.id)
  const pastIds = past.map((p) => p.id)
  const hasPlans = upcoming.length > 0 || pastResult.totalDocs > 0

  return (
    <BulkSelectProvider>
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Cultes</h1>
        <div className="flex items-center gap-2">
          {hasPlans && (
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
          {isAdmin && <PlanningShare token={shareToken} />}
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

      {!hasPlans ? (
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
                      aria-label={`Ouvrir ${planLabelOf(plan)}`}
                    />
                    {isAdmin && (
                      <div className="relative z-10 pt-0.5">
                        <BulkCheckbox id={plan.id} label={`Sélectionner ${planLabelOf(plan)}`} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{formatDate(plan.date)}</p>
                      {plan.title?.trim() && (
                        <p className="text-sm text-muted-foreground">{plan.title.trim()}</p>
                      )}
                      <div className="mt-1">
                        <Assignments assignments={plan.assignments as Assignment[]} view={view} />
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="relative z-10">
                        <PlanActions
                          planId={plan.id}
                          planLabel={planNameOf(plan)}
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
                      aria-label={`Ouvrir ${planLabelOf(plan)}`}
                    />
                    {isAdmin && (
                      <div className="relative z-10 pt-0.5">
                        <BulkCheckbox id={plan.id} label={`Sélectionner ${planLabelOf(plan)}`} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{formatDate(plan.date)}</p>
                      {plan.title?.trim() && (
                        <p className="text-sm text-muted-foreground">{plan.title.trim()}</p>
                      )}
                      <div className="mt-1">
                        <Assignments assignments={plan.assignments as Assignment[]} view={view} />
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="relative z-10">
                        <PlanActions
                          planId={plan.id}
                          planLabel={planNameOf(plan)}
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
                        <TableHead className="w-[18%]">Date</TableHead>
                        <TableHead className="w-[72%]">Affectations</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcoming.map((plan) => (
                        <TableRow key={plan.id} className="relative cursor-pointer hover:bg-raisin/5">
                          {isAdmin && (
                            <TableCell className="relative z-10 w-px align-top">
                              <BulkCheckbox id={plan.id} label={`Sélectionner ${planLabelOf(plan)}`} />
                            </TableCell>
                          )}
                          <TableCell className="align-top font-medium whitespace-nowrap">
                            <Link
                              href={`/dashboard/planning/${plan.id}/edit`}
                              className="absolute inset-0"
                              aria-label={`Ouvrir ${planLabelOf(plan)}`}
                            />
                            {formatDate(plan.date)}
                            {plan.title?.trim() && (
                              <span className="block whitespace-normal text-xs font-normal text-muted-foreground">
                                {plan.title.trim()}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="align-top whitespace-normal">
                            <Assignments assignments={plan.assignments as Assignment[]} view={view} />
                          </TableCell>
                          <TableCell className="relative z-10 w-px align-top">
                            {isAdmin && (
                              <PlanActions
                                planId={plan.id}
                                planLabel={planNameOf(plan)}
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
                        <TableHead className="w-[18%]">Date</TableHead>
                        <TableHead className="w-[72%]">Affectations</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {past.map((plan) => (
                        <TableRow key={plan.id} className="relative cursor-pointer hover:bg-raisin/5">
                          {isAdmin && (
                            <TableCell className="relative z-10 w-px align-top">
                              <BulkCheckbox id={plan.id} label={`Sélectionner ${planLabelOf(plan)}`} />
                            </TableCell>
                          )}
                          <TableCell className="align-top font-medium whitespace-nowrap">
                            <Link
                              href={`/dashboard/planning/${plan.id}/edit`}
                              className="absolute inset-0"
                              aria-label={`Ouvrir ${planLabelOf(plan)}`}
                            />
                            {formatDate(plan.date)}
                            {plan.title?.trim() && (
                              <span className="block whitespace-normal text-xs font-normal text-muted-foreground">
                                {plan.title.trim()}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="align-top whitespace-normal">
                            <Assignments assignments={plan.assignments as Assignment[]} view={view} />
                          </TableCell>
                          <TableCell className="relative z-10 w-px align-top">
                            {isAdmin && (
                              <PlanActions
                                planId={plan.id}
                                planLabel={planNameOf(plan)}
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

          <Pagination
            basePath="/dashboard/planning"
            searchParams={params}
            param="passes"
            page={pastPage}
            totalPages={pastResult.totalPages}
            label="des cultes passés"
          />
        </>
      )}
    </div>
    {isAdmin && <BulkActionBar collection="service-plans" noun={{ one: 'culte', many: 'cultes' }} />}
    </BulkSelectProvider>
  )
}
