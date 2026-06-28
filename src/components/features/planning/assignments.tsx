export type MemberDoc = { id: number; firstName: string; lastName: string }
export type GroupDoc = { id: number; name: string; leader?: MemberDoc | number | null }
export type Assignment = {
  role: string
  members: MemberDoc[] | number[] | null
  group?: GroupDoc | number | null
}
export type ViewMode = 'compact' | 'detailed'

export function isFilled(a: Assignment): boolean {
  return (Array.isArray(a.members) && a.members.length > 0) || a.group != null
}

export function summarizeAssignments(assignments: Assignment[] | undefined): string {
  if (!assignments || assignments.length === 0) return '—'
  const filled = assignments.filter(isFilled).length
  return `${filled} / ${assignments.length} rôles assignés`
}

export function getAssignmentDetails(assignments: Assignment[] | undefined) {
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
export function Assignments({
  assignments,
  view,
}: {
  assignments: Assignment[] | undefined
  view: ViewMode
}) {
  if (view !== 'detailed') {
    return <span className="text-sm text-muted-foreground">{summarizeAssignments(assignments)}</span>
  }
  const details = getAssignmentDetails(assignments)
  if (details.length === 0) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
      {details.map((d, i) => {
        const parts = [d.groupLabel, ...d.names].filter(Boolean) as string[]
        return (
          <div key={i} className="flex gap-x-1.5 text-sm">
            <span className="font-medium text-foreground whitespace-nowrap">{d.role} :</span>
            <span
              className={
                parts.length
                  ? 'text-muted-foreground'
                  : 'italic text-muted-foreground/50 whitespace-nowrap'
              }
            >
              {parts.length ? parts.join(', ') : 'non assigné'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
