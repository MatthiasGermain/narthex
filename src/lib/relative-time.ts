export function formatRelativeTime(isoDate: string | null | undefined): string {
  if (!isoDate) return 'Jamais'

  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 30) return `Il y a ${diffDays} jours`

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `Il y a ${diffMonths} mois`

  return "Il y a plus d'un an"
}
