import Link from 'next/link'
import { CalendarDays, ChevronRight, FileText, UserRound } from 'lucide-react'
import { formatFrenchDate } from '@/lib/date-utils'
import {
  getAssignmentDetails,
  isFilled,
  type Assignment,
} from '@/components/features/planning/assignments'

interface Plan {
  id: number
  title?: string | null
  date: string
  notes?: string | null
  assignments: Assignment[]
}

interface ThisSundayProps {
  plan: Plan | null
  isAdmin: boolean
  /** Feuille d'annonces du culte : nombre d'annonces lues, et si l'utilisateur préside. */
  announcements?: { count: number; presiding: boolean } | null
}

function getDateLabel(dateISO: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const planDate = new Date(dateISO)
  planDate.setHours(0, 0, 0, 0)

  const diffDays = Math.round((planDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Demain'
  if (planDate.getDay() === 0 && diffDays <= 7) return 'Ce dimanche'
  return 'Prochain culte'
}

export function ThisSunday({ plan, isAdmin, announcements }: ThisSundayProps) {
  if (!plan) return null

  const planDate = new Date(plan.date)
  const dateLabel = getDateLabel(plan.date)
  const dateFormatted = formatFrenchDate(planDate)
  // Uniquement si le culte a été nommé : afficher « · Culte » n'apprendrait rien.
  const planTitle = plan.title?.trim() || null

  const assignments = plan.assignments ?? []
  const totalRoles = assignments.length
  // Même règle que la liste des cultes : un rôle tenu par un groupe est rempli.
  const filledRoles = assignments.filter(isFilled).length

  const allFilled = filledRoles === totalRoles && totalRoles > 0

  return (
    <div className="rounded-lg border border-raisin/8 bg-raisin/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-raisin/8">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-sm leading-none">
              {dateLabel}
              {planTitle && (
                <span className="font-normal text-muted-foreground"> · {planTitle}</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">{dateFormatted}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalRoles > 0 && (
            <span className={`text-xs font-medium ${allFilled ? 'text-green-600' : 'text-muted-foreground'}`}>
              {filledRoles}/{totalRoles} rôles
            </span>
          )}
          {isAdmin && (
            <Link
              href={`/dashboard/planning/${plan.id}/edit`}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Modifier"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Annonces : mises en avant pour la personne qui préside */}
      {announcements && (
        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-b border-raisin/8 px-4 py-2.5 ${
            announcements.presiding ? 'bg-sunglow/15' : ''
          }`}
        >
          <p className="text-sm">
            {announcements.presiding && <span className="font-semibold">Vous présidez · </span>}
            {announcements.count === 0
              ? 'Aucune annonce'
              : `${announcements.count} annonce${announcements.count > 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-4">
            {(announcements.presiding || isAdmin) && (
              <Link
                href={`/dashboard/planning/${plan.id}/annonces`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Préparer
              </Link>
            )}
            <Link href={`/annonces/${plan.id}`} className="text-sm font-medium text-primary hover:underline">
              {announcements.presiding ? 'Lire au pupitre' : 'Voir les annonces'}
            </Link>
          </div>
        </div>
      )}

      {/* Assignments grid */}
      {assignments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-raisin/8">
          {getAssignmentDetails(assignments).map((d, index) => {
            // Groupe (ex : Louange) puis membres, comme dans la vue détaillée des cultes.
            const people = [d.groupLabel, ...d.names].filter(Boolean) as string[]
            const isEmpty = people.length === 0

            return (
              <div
                key={`${d.role}-${index}`}
                className="flex items-start gap-2.5 px-4 py-2.5 border-b border-raisin/8 last:border-b-0 sm:nth-last-[-n+2]:border-b-0"
              >
                <UserRound
                  className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${isEmpty ? 'text-muted-foreground/40' : 'text-primary/60'}`}
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground leading-none mb-0.5">
                    {d.role}
                  </p>
                  {isEmpty ? (
                    <p className="text-sm text-muted-foreground/50 italic">Non assigné</p>
                  ) : (
                    <p className="text-sm font-medium truncate">{people.join(', ')}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Notes */}
      {plan.notes && (
        <div className="flex items-start gap-2 px-4 py-2.5 border-t border-raisin/8 bg-raisin/3">
          <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground line-clamp-2">{plan.notes}</p>
        </div>
      )}
    </div>
  )
}
