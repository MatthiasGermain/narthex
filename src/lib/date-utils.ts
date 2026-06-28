const TIMEZONE = 'Europe/Paris'

/**
 * Retourne la date "aujourd'hui" en fuseau Europe/Paris, au format YYYY-MM-DD.
 */
export function getTodayISO(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: TIMEZONE })
}

/**
 * Retourne un objet Date pour "maintenant" recalé sur le fuseau Europe/Paris.
 * Utile pour les comparaisons de jour (début/fin de mois, etc.).
 */
export function getNowParis(): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const get = (type: string) => parts.find((p) => p.type === type)?.value || '0'
  return new Date(
    Number(get('year')),
    Number(get('month')) - 1,
    Number(get('day')),
    Number(get('hour')),
    Number(get('minute')),
    Number(get('second')),
  )
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
