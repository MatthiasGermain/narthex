import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { ClipboardList } from 'lucide-react'

import config from '@/payload.config'
import { formatDate, isPast } from '@/lib/format'
import { Assignments, type Assignment } from '@/components/features/planning/assignments'

// Lien privé : ne pas indexer
export const metadata = {
  robots: { index: false, follow: false },
}

export default async function SharedPlanningPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  if (!token) notFound()

  const payload = await getPayload({ config: await config })

  const { docs: churches } = await payload.find({
    collection: 'churches',
    where: { planningShareToken: { equals: token } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const church = churches[0]
  if (!church) notFound()

  const { docs: plans } = await payload.find({
    collection: 'service-plans',
    where: { church: { equals: church.id } },
    sort: 'date',
    limit: 100,
    depth: 2,
    overrideAccess: true,
  })

  // À venir uniquement, du plus proche au plus lointain
  const upcoming = plans.filter((p) => !isPast(p.date))

  return (
    <div className="min-h-screen bg-cream px-4 py-8 sm:py-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold">{church.name}</h1>
          <p className="text-muted-foreground">Planning des cultes à venir</p>
        </header>

        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-raisin/8 bg-raisin/5 py-16 text-center text-muted-foreground">
            <ClipboardList className="mb-4 h-12 w-12 opacity-50" />
            <p className="text-lg font-medium">Aucun culte à venir</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((plan) => (
              <div
                key={plan.id}
                className="rounded-lg border border-raisin/8 bg-raisin/5 p-4"
              >
                <p className="font-medium capitalize">{formatDate(plan.date)}</p>
                {plan.title?.trim() && (
                  <p className="text-sm text-muted-foreground">{plan.title.trim()}</p>
                )}
                <div className="mt-2">
                  <Assignments
                    assignments={plan.assignments as Assignment[]}
                    view="detailed"
                  />
                </div>
                {plan.notes && (
                  <p className="mt-3 border-t border-raisin/8 pt-2 text-sm text-muted-foreground">
                    {plan.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          Lien de consultation en lecture seule · propulsé par Narthex
        </footer>
      </div>
    </div>
  )
}
