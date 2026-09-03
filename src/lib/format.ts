export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Format numérique court : "21 juin 2026" */
export function formatDateNumeric(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Plage de dates d'un rassemblement, sans répéter ce qui est commun :
 * « 14 juin 2026 » · « 12 – 14 juin 2026 » · « 30 mai – 2 juin 2026 ».
 */
export function formatDateRange(startISO: string, endISO: string): string {
  const start = new Date(startISO)
  const end = new Date(endISO)
  const day = (d: Date) => d.getDate()
  const month = (d: Date) => d.toLocaleDateString('fr-FR', { month: 'long' })

  if (start.toDateString() === end.toDateString()) {
    return `${day(start)} ${month(start)} ${start.getFullYear()}`
  }
  if (start.getFullYear() === end.getFullYear()) {
    return start.getMonth() === end.getMonth()
      ? `${day(start)} – ${day(end)} ${month(end)} ${end.getFullYear()}`
      : `${day(start)} ${month(start)} – ${day(end)} ${month(end)} ${end.getFullYear()}`
  }
  return `${day(start)} ${month(start)} ${start.getFullYear()} – ${day(end)} ${month(end)} ${end.getFullYear()}`
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':')
  return m === '00' ? `${parseInt(h)}h` : `${parseInt(h)}h${m}`
}

/** Alias de formatTime, conservé pour les pages publiques. */
export const formatServiceTime = formatTime

/**
 * Nom affiché d'un culte. Le champ `title` est optionnel : sans nom, on retombe
 * sur « Culte », le libellé utilisé partout avant l'ajout du champ.
 */
export function servicePlanTitle(title?: string | null): string {
  return title?.trim() || 'Culte'
}

/** Un jour est-il passé (avant aujourd'hui, minuit local) ? */
export function isPast(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr) < today
}

/** Initiales en majuscules à partir du prénom et du nom. */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
}

