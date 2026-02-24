/**
 * Retourne le prochain dimanche (ou aujourd'hui si dimanche).
 */
export function getNextSunday(from: Date = new Date()): Date {
  const d = new Date(from)
  d.setHours(0, 0, 0, 0)
  const dayOfWeek = d.getDay() // 0 = dimanche
  if (dayOfWeek === 0) return d
  d.setDate(d.getDate() + (7 - dayOfWeek))
  return d
}

/**
 * Formate une date en français : "Dimanche 1er mars 2026"
 */
export function formatFrenchDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
