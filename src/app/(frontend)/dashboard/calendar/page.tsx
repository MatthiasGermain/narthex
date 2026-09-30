import { resolveTenant } from '@/lib/tenant'
import { isAdminRole } from '@/access'
import { formatFrenchDate, getTodayISO, getNowParis } from '@/lib/date-utils'
import { servicePlanTitle } from '@/lib/format'
import { CalendarGrid } from '@/components/dashboard/calendar-grid'
import type { TimelineItem } from '@/components/dashboard/monthly-timeline'
import { isFilled, type Assignment } from '@/components/features/planning/assignments'

interface Props {
  searchParams: Promise<{ month?: string }>
}

export default async function CalendarPage({ searchParams }: Props) {
  const { payload, user, tenant } = await resolveTenant()
  if (!user || !tenant) return null

  const isAdmin = isAdminRole(user)

  // Mois demandé (ou mois courant)
  const params = await searchParams
  const now = getNowParis()
  let year = now.getFullYear()
  let month = now.getMonth()

  if (params.month && /^\d{4}-\d{2}$/.test(params.month)) {
    const [y, m] = params.month.split('-').map(Number)
    year = y
    month = m - 1
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  // Plage du mois complet (toujours jour 1 → dernier jour)
  const endOfMonth = new Date(year, month + 1, 0)

  const pad = (n: number) => String(n).padStart(2, '0')
  const startISO = `${year}-${pad(month + 1)}-01`
  const endISO = `${year}-${pad(month + 1)}-${pad(endOfMonth.getDate())}`

  // Navigation
  const prevDate = new Date(year, month - 1, 1)
  const nextDate = new Date(year, month + 1, 1)
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
  const nextMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
  const monthLabel = new Date(year, month).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })

  const todayISO = getTodayISO()

  // Requêtes en parallèle
  const [plansResult, eventsResult] = await Promise.all([
    payload.find({
      collection: 'service-plans',
      where: {
        church: { equals: tenant.id },
        date: {
          greater_than_equal: `${startISO}T00:00:00.000Z`,
          less_than_equal: `${endISO}T23:59:59.999Z`,
        },
      },
      sort: 'date',
      limit: 31,
      // depth 0 suffit : on ne compte que les rôles assignés, sans afficher de noms
      depth: 0,
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'events',
      where: {
        church: { equals: tenant.id },
        date: {
          greater_than_equal: `${startISO}T00:00:00.000Z`,
          less_than_equal: `${endISO}T23:59:59.999Z`,
        },
      },
      sort: 'date',
      limit: 50,
      depth: 1,
      overrideAccess: false,
      user,
    }),
  ])

  // Construire les items (même pattern que dashboard/page.tsx)
  const planItems: TimelineItem[] = plansResult.docs.map((plan) => {
    const d = new Date(plan.date)
    const dateISO = d.toISOString().split('T')[0]
    const assignments = plan.assignments as Assignment[] | null | undefined
    const totalRoles = assignments?.length ?? 0
    // Même règle que la liste des cultes : un rôle tenu par un groupe est rempli.
    const filledRoles = assignments?.filter(isFilled).length ?? 0

    return {
      type: 'culte' as const,
      id: plan.id,
      date: dateISO,
      dateFormatted: formatFrenchDate(d),
      title: servicePlanTitle(plan.title),
      filledRoles,
      totalRoles,
      href: isAdmin ? `/dashboard/planning/${plan.id}/edit` : '#',
    }
  })

  const eventItems: TimelineItem[] = eventsResult.docs.map((e) => {
    const d = new Date(e.date as string)
    const dateISO = d.toISOString().split('T')[0]
    const room = typeof e.room === 'object' && e.room ? (e.room as { name: string }).name : null
    const location = (e.location as string) || null

    return {
      type: 'event' as const,
      id: e.id as number,
      date: dateISO,
      dateFormatted: formatFrenchDate(d),
      title: (e.title as string) || '',
      time: (e.time as string) || null,
      location: room || location,
      visibility: (e.visibility as string) || 'public',
      href: `/dashboard/events/${e.id}/edit`,
    }
  })

  // Fusionner et trier
  const items = [...planItems, ...eventItems].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date)
    if (cmp !== 0) return cmp
    if (a.type === 'culte' && b.type !== 'culte') return -1
    if (a.type !== 'culte' && b.type === 'culte') return 1
    return 0
  })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Calendrier</h1>
      <CalendarGrid
        items={items}
        isAdmin={isAdmin}
        year={year}
        month={month}
        monthLabel={monthLabel}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
        isCurrentMonth={isCurrentMonth}
        todayISO={todayISO}
      />
    </div>
  )
}
