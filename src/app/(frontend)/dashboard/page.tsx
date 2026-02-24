import Link from 'next/link'
import { Calendar, DoorOpen, Users } from 'lucide-react'
import { resolveTenant } from '@/lib/tenant'
import { formatFrenchDate } from '@/lib/date-utils'
import { MonthlyTimeline, type TimelineItem } from '@/components/dashboard/monthly-timeline'

interface Props {
  searchParams: Promise<{ month?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const { payload, user, tenant } = await resolveTenant()
  if (!user || !tenant) return null

  const isAdmin = user.role === 'super-admin' || user.role === 'admin-church'

  // Mois demandé (ou mois courant)
  const params = await searchParams
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() // 0-indexed

  if (params.month && /^\d{4}-\d{2}$/.test(params.month)) {
    const [y, m] = params.month.split('-').map(Number)
    year = y
    month = m - 1
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  // Plage du mois
  const startOfMonth = isCurrentMonth
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0)

  const startISO = startOfMonth.toISOString().split('T')[0]
  const endISO = endOfMonth.toISOString().split('T')[0]

  // Navigation
  const prevDate = new Date(year, month - 1, 1)
  const nextDate = new Date(year, month + 1, 1)
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
  const nextMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
  const monthLabel = new Date(year, month).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })

  // Requêtes en parallèle
  const plansPromise = payload.find({
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
    depth: 2,
    overrideAccess: false,
    user,
  })

  const eventsPromise = payload.find({
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
  })

  const todayISO = now.toISOString().split('T')[0]
  const statsPromises = isAdmin
    ? [
        payload.find({
          collection: 'events',
          where: { church: { equals: tenant.id }, date: { greater_than_equal: `${todayISO}T00:00:00.000Z` } },
          limit: 0, depth: 0, overrideAccess: false, user,
        }),
        payload.find({
          collection: 'rooms',
          where: { church: { equals: tenant.id }, isActive: { equals: true } },
          limit: 0, depth: 0, overrideAccess: false, user,
        }),
        payload.find({
          collection: 'members',
          where: { church: { equals: tenant.id }, isActive: { equals: true } },
          limit: 0, depth: 0, overrideAccess: false, user,
        }),
      ]
    : []

  const [plansResult, eventsResult, ...statsResults] = await Promise.all([
    plansPromise,
    eventsPromise,
    ...statsPromises,
  ])

  const totalEvents = statsResults[0]?.totalDocs ?? 0
  const totalRooms = statsResults[1]?.totalDocs ?? 0
  const totalMembers = statsResults[2]?.totalDocs ?? 0

  // Construire les items
  type MemberDoc = { id: number; firstName: string; lastName: string }

  const planItems: TimelineItem[] = plansResult.docs.map((plan) => {
    const d = new Date(plan.date)
    const dateISO = d.toISOString().split('T')[0]
    const assignments = plan.assignments as Array<{ role: string; members: MemberDoc[] | null }> | undefined
    const totalRoles = assignments?.length ?? 0
    const filledRoles = assignments?.filter((a) => a.members && a.members.length > 0).length ?? 0

    return {
      type: 'culte' as const,
      id: plan.id,
      date: dateISO,
      dateFormatted: formatFrenchDate(d),
      title: 'Culte',
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-1">Bienvenue, {user.email}</p>
      </div>

      <MonthlyTimeline
        items={items}
        isAdmin={isAdmin}
        monthLabel={monthLabel}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
        isCurrentMonth={isCurrentMonth}
      />

      {/* Stats admin */}
      {isAdmin && (
        <div className="grid grid-cols-3 gap-3">
          <Link href="/dashboard/events" className="flex items-center gap-2 rounded-lg border p-3 hover:border-primary/50 transition-colors">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold leading-none">{totalEvents}</p>
              <p className="text-xs text-muted-foreground">Événements</p>
            </div>
          </Link>
          <Link href="/dashboard/rooms" className="flex items-center gap-2 rounded-lg border p-3 hover:border-primary/50 transition-colors">
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold leading-none">{totalRooms}</p>
              <p className="text-xs text-muted-foreground">Salles</p>
            </div>
          </Link>
          <Link href="/dashboard/members" className="flex items-center gap-2 rounded-lg border p-3 hover:border-primary/50 transition-colors">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold leading-none">{totalMembers}</p>
              <p className="text-xs text-muted-foreground">Membres</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
