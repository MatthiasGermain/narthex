import Link from 'next/link'
import { Plus, ClipboardList } from 'lucide-react'

import { resolveTenant } from '@/lib/tenant'
import { formatDate } from '@/lib/format'
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

function isPast(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr) < today
}

type MemberDoc = { id: number; firstName: string; lastName: string }

function summarizeAssignments(
  assignments: Array<{ role: string; members: MemberDoc[] | number[] | null }> | undefined,
): string {
  if (!assignments || assignments.length === 0) return '—'
  const filled = assignments.filter(
    (a) => Array.isArray(a.members) && a.members.length > 0,
  ).length
  return `${filled} / ${assignments.length} rôles assignés`
}

export default async function PlanningPage() {
  const { payload, user, tenant } = await resolveTenant()

  if (!user) return null
  if (!tenant) return null

  const isAdmin = user.role === 'super-admin' || user.role === 'admin-church'

  const { docs: plans } = await payload.find({
    collection: 'service-plans',
    where: {
      church: { equals: tenant.id },
    },
    sort: '-date',
    limit: 50,
    depth: 2,
    overrideAccess: false,
    user,
  })

  const upcoming = plans.filter((p) => !isPast(p.date))
  const past = plans.filter((p) => isPast(p.date))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Cultes</h1>
        {isAdmin && (
          <Link href="/dashboard/planning/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouveau culte</span>
            </Button>
          </Link>
        )}
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
                    className="flex items-start justify-between gap-3 rounded-lg border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{formatDate(plan.date)}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {summarizeAssignments(
                          plan.assignments as Array<{
                            role: string
                            members: MemberDoc[] | number[] | null
                          }>,
                        )}
                      </p>
                    </div>
                    {isAdmin && (
                      <PlanActions
                        planId={plan.id}
                        planLabel={formatDate(plan.date)}
                        canDelete={isAdmin}
                      />
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
                    className="flex items-start justify-between gap-3 rounded-lg border p-4 opacity-60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{formatDate(plan.date)}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {summarizeAssignments(
                          plan.assignments as Array<{
                            role: string
                            members: MemberDoc[] | number[] | null
                          }>,
                        )}
                      </p>
                    </div>
                    {isAdmin && (
                      <PlanActions
                        planId={plan.id}
                        planLabel={formatDate(plan.date)}
                        canDelete={isAdmin}
                      />
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
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[35%]">Date</TableHead>
                        <TableHead className="w-[45%]">Affectations</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcoming.map((plan) => (
                        <TableRow key={plan.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{formatDate(plan.date)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {summarizeAssignments(
                              plan.assignments as Array<{
                                role: string
                                members: MemberDoc[] | number[] | null
                              }>,
                            )}
                          </TableCell>
                          <TableCell>
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
                <div className="rounded-lg border overflow-hidden opacity-60">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[35%]">Date</TableHead>
                        <TableHead className="w-[45%]">Affectations</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {past.map((plan) => (
                        <TableRow key={plan.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{formatDate(plan.date)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {summarizeAssignments(
                              plan.assignments as Array<{
                                role: string
                                members: MemberDoc[] | number[] | null
                              }>,
                            )}
                          </TableCell>
                          <TableCell>
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
  )
}
