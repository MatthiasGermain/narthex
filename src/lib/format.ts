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

export function formatTime(time: string): string {
  const [h, m] = time.split(':')
  return m === '00' ? `${parseInt(h)}h` : `${parseInt(h)}h${m}`
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

export function formatServiceTime(time: string): string {
  const [h, m] = time.split(':')
  return m === '00' ? `${parseInt(h)}h` : `${parseInt(h)}h${m}`
}
