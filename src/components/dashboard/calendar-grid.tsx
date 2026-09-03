'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarDayDetail } from '@/components/dashboard/calendar-day-detail'
import { formatFrenchDate } from '@/lib/date-utils'
import type { TimelineItem } from '@/components/dashboard/monthly-timeline'

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

interface CalendarGridProps {
  items: TimelineItem[]
  isAdmin: boolean
  year: number
  month: number
  monthLabel: string
  prevMonth: string
  nextMonth: string
  isCurrentMonth: boolean
  todayISO: string
}

interface CellDescriptor {
  date: string
  dayNum: number
  isCurrentMonth: boolean
  isToday: boolean
}

/** Format YYYY-MM-DD sans passer par UTC */
function toLocalISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function buildGrid(year: number, month: number, todayISO: string): CellDescriptor[] {
  const firstDay = new Date(year, month, 1)
  const startPadding = (firstDay.getDay() + 6) % 7 // Monday-start
  const lastDay = new Date(year, month + 1, 0).getDate()

  const cells: CellDescriptor[] = []

  // Jours du mois précédent
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  const prevY = month === 0 ? year - 1 : year
  const prevM = month === 0 ? 11 : month - 1
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    cells.push({
      date: toLocalISO(prevY, prevM, d),
      dayNum: d,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  // Jours du mois courant
  for (let d = 1; d <= lastDay; d++) {
    const iso = toLocalISO(year, month, d)
    cells.push({
      date: iso,
      dayNum: d,
      isCurrentMonth: true,
      isToday: iso === todayISO,
    })
  }

  // Jours du mois suivant (compléter à 42 cellules)
  const nextY = month === 11 ? year + 1 : year
  const nextM = month === 11 ? 0 : month + 1
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      date: toLocalISO(nextY, nextM, d),
      dayNum: d,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  return cells
}

export function CalendarGrid({
  items,
  isAdmin,
  year,
  month,
  monthLabel,
  prevMonth,
  nextMonth,
  isCurrentMonth,
  todayISO,
}: CalendarGridProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    isCurrentMonth ? todayISO : null,
  )

  const cells = useMemo(() => buildGrid(year, month, todayISO), [year, month, todayISO])

  const itemsByDate = useMemo(() => {
    const map = new Map<string, TimelineItem[]>()
    for (const item of items) {
      if (!map.has(item.date)) map.set(item.date, [])
      map.get(item.date)!.push(item)
    }
    return map
  }, [items])

  const selectedItems = selectedDate ? (itemsByDate.get(selectedDate) || []) : []
  const selectedDateFormatted = selectedDate
    ? formatFrenchDate(new Date(selectedDate + 'T12:00:00'))
    : ''

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation mois */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
          <Link href={`/dashboard/calendar?month=${prevMonth}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="text-center min-w-35">
          <h2 className="text-base font-semibold capitalize">{monthLabel}</h2>
          {!isCurrentMonth && (
            <Link
              href="/dashboard/calendar"
              className="text-xs text-primary hover:underline"
            >
              Revenir à aujourd&apos;hui
            </Link>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
          <Link href={`/dashboard/calendar?month=${nextMonth}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Layout desktop: grid + panel / Mobile: grid + section */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Grille */}
        <div className="flex-1 min-w-0">
          {/* En-tête jours */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map((name) => (
              <div key={name} className="text-center text-xs text-muted-foreground uppercase tracking-wide py-1.5 font-medium">
                {name}
              </div>
            ))}
          </div>

          {/* Cellules */}
          <div className="grid grid-cols-7 border border-raisin/8 rounded-lg overflow-hidden">
            {cells.map((cell, i) => {
              const dayItems = itemsByDate.get(cell.date) || []
              const isSelected = cell.date === selectedDate
              const hasCulte = dayItems.some((it) => it.type === 'culte')
              const hasEvent = dayItems.some((it) => it.type === 'event')
              const maxPills = 2
              const overflow = dayItems.length - maxPills

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDate(cell.date)}
                  className={`
                    relative flex flex-col items-start p-1 md:p-1.5 min-h-10 md:min-h-20
                    border-b border-r border-raisin/8 text-left transition-colors
                    hover:bg-raisin/5 cursor-pointer
                    ${!cell.isCurrentMonth ? 'opacity-40' : ''}
                    ${isSelected ? 'ring-2 ring-inset ring-primary bg-primary/5' : ''}
                    ${i % 7 === 6 ? 'border-r-0' : ''}
                    ${i >= 35 ? 'border-b-0' : ''}
                  `}
                >
                  {/* Numéro du jour */}
                  <span
                    className={`
                      text-xs md:text-sm font-medium leading-none
                      ${cell.isToday
                        ? 'bg-primary text-primary-foreground rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center'
                        : ''
                      }
                    `}
                  >
                    {cell.dayNum}
                  </span>

                  {/* Desktop: pills */}
                  <div className="hidden md:flex flex-col gap-0.5 mt-1 w-full">
                    {dayItems.slice(0, maxPills).map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className={`text-[11px] leading-tight px-1.5 py-0.5 rounded truncate ${
                          item.type === 'culte'
                            ? 'bg-primary/15 text-primary'
                            : 'bg-sunglow/15 text-raisin'
                        }`}
                      >
                        {item.title}
                      </div>
                    ))}
                    {overflow > 0 && (
                      <span className="text-[10px] text-muted-foreground pl-1">
                        +{overflow}
                      </span>
                    )}
                  </div>

                  {/* Mobile: dots */}
                  {(hasCulte || hasEvent) && (
                    <div className="flex md:hidden gap-1 mt-0.5 justify-center w-full">
                      {hasCulte && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      {hasEvent && <span className="w-1.5 h-1.5 rounded-full bg-sunglow" />}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Panneau détail - desktop */}
        <div className="hidden md:block w-72 lg:w-80 shrink-0">
          <div className="sticky top-4 rounded-lg border border-raisin/8 bg-raisin/5 min-h-48">
            <CalendarDayDetail
              date={selectedDate}
              dateFormatted={selectedDateFormatted}
              items={selectedItems}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>

      {/* Panneau détail - mobile */}
      {selectedDate && (
        <div className="md:hidden rounded-lg border border-raisin/8 bg-raisin/5">
          <CalendarDayDetail
            date={selectedDate}
            dateFormatted={selectedDateFormatted}
            items={selectedItems}
            isAdmin={isAdmin}
          />
        </div>
      )}
    </div>
  )
}
