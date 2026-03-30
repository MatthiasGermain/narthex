'use client'

import Link from 'next/link'
import { Sun, Calendar, MapPin, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { TimelineItem } from '@/components/dashboard/monthly-timeline'

interface CalendarDayDetailProps {
  date: string | null
  dateFormatted: string
  items: TimelineItem[]
  isAdmin: boolean
}

export function CalendarDayDetail({ date, dateFormatted, items, isAdmin }: CalendarDayDetailProps) {
  if (!date) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-6">
        Sélectionnez un jour
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="font-heading font-bold text-base capitalize">{dateFormatted}</h3>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Rien de prévu ce jour</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-raisin/5 transition-colors"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  item.type === 'culte'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-sunglow/15 text-raisin'
                }`}
              >
                {item.type === 'culte' ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Calendar className="h-3.5 w-3.5" />
                )}
              </div>

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
      )}

      {isAdmin && date && (
        <div className="flex gap-2 pt-2 border-t border-raisin/8">
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link href={`/dashboard/planning/new?date=${date}`}>
              <Plus className="h-3 w-3 mr-1" />
              Culte
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link href={`/dashboard/events/new?date=${date}`}>
              <Plus className="h-3 w-3 mr-1" />
              Événement
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
