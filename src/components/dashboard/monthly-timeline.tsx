import Link from 'next/link'
import { Sun, Calendar, MapPin, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface TimelineItem {
  type: 'culte' | 'event'
  id: number
  date: string
  dateFormatted: string
  title: string
  time?: string | null
  location?: string | null
  visibility?: string
  filledRoles?: number
  totalRoles?: number
  href: string
}

interface MonthlyTimelineProps {
  items: TimelineItem[]
  isAdmin: boolean
  monthLabel: string
  prevMonth: string
  nextMonth: string
  isCurrentMonth: boolean
}

export function MonthlyTimeline({
  items,
  isAdmin,
  monthLabel,
  prevMonth,
  nextMonth,
  isCurrentMonth,
}: MonthlyTimelineProps) {
  return (
    <div>
      {/* Navigation mois */}
      <div className="flex items-center justify-center gap-4 mb-5">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
          <Link href={`/dashboard?month=${prevMonth}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="text-center min-w-35">
          <h2 className="text-base font-semibold capitalize">{monthLabel}</h2>
          {!isCurrentMonth && (
            <Link
              href="/dashboard"
              className="text-xs text-primary hover:underline"
            >
              Revenir à aujourd&apos;hui
            </Link>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
          <Link href={`/dashboard?month=${nextMonth}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Contenu */}
      {items.length === 0 ? (
        <div className="rounded-lg border border-raisin/8 border-dashed bg-raisin/5 flex flex-col items-center justify-center py-10 text-center">
          <ClipboardList className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="font-medium text-sm">Rien de prévu</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isAdmin
              ? 'Créez un culte ou un événement pour commencer.'
              : 'Aucun culte ou événement n\u2019est planifié ce mois.'}
          </p>
          {isAdmin && (
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="text-xs" asChild>
                <Link href="/dashboard/planning/new">Nouveau culte</Link>
              </Button>
              <Button variant="outline" size="sm" className="text-xs" asChild>
                <Link href="/dashboard/events/new">Nouvel événement</Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {groupByDate(items).map(([, dayItems]) => {
            const d = new Date(dayItems[0].date + 'T12:00:00')
            const dayNum = d.getDate()
            const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')

            return (
              <div key={dayItems[0].date} className="flex gap-4">
                {/* Colonne date */}
                <div className="w-10 shrink-0 text-center pt-3">
                  <p className="text-lg font-bold leading-none">{dayNum}</p>
                  <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{dayName}</p>
                </div>

                {/* Colonne contenu */}
                <div className="flex-1 min-w-0 rounded-lg border border-raisin/8 bg-raisin/5 divide-y divide-raisin/8 overflow-hidden">
                  {dayItems.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-raisin/5 transition-colors"
                    >
                      {/* Pastille type */}
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          item.type === 'culte'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {item.type === 'culte' ? (
                          <Sun className="h-3.5 w-3.5" />
                        ) : (
                          <Calendar className="h-3.5 w-3.5" />
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium truncate">{item.title}</span>
                          {item.visibility === 'internal' && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                              Interne
                            </Badge>
                          )}
                        </div>
                        {(item.time || item.location) && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {item.time}
                            {item.time && item.location && ' · '}
                            {item.location && (
                              <><MapPin className="inline h-3 w-3 -mt-px" /> {item.location}</>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Compteur rôles */}
                      {item.type === 'culte' && item.totalRoles != null && item.totalRoles > 0 && (
                        <span className={`text-xs shrink-0 tabular-nums ${
                          item.filledRoles === item.totalRoles
                            ? 'text-green-600'
                            : 'text-muted-foreground'
                        }`}>
                          {item.filledRoles}/{item.totalRoles}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function groupByDate(items: TimelineItem[]): [string, TimelineItem[]][] {
  const grouped = new Map<string, TimelineItem[]>()
  for (const item of items) {
    if (!grouped.has(item.date)) grouped.set(item.date, [])
    grouped.get(item.date)!.push(item)
  }
  return Array.from(grouped.entries())
}
