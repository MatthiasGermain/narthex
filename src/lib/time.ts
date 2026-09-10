/**
 * Heures au format HH:mm, telles que stockées dans Payload (champs texte).
 * Sans dépendance à Next ni à Payload : importable depuis les collections
 * comme depuis les formulaires.
 */

const TIME_PATTERN = /^\d{2}:\d{2}$/

/** « 20:30 » → 1230 minutes depuis minuit. null si le format ou la valeur est invalide. */
export function toMinutes(value: string | null | undefined): number | null {
  if (!value || !TIME_PATTERN.test(value)) return null
  const [h, m] = value.split(':').map(Number)
  if (h > 23 || m > 59) return null
  return h * 60 + m
}

/** Validation Payload d'une heure (l'obligation éventuelle est portée par `required`). */
export function validateTime(value: string | null | undefined): true | string {
  if (!value) return true
  if (!TIME_PATTERN.test(value)) return 'Format attendu : HH:mm (ex: 20:00)'
  if (toMinutes(value) === null) return 'Heure invalide'
  return true
}

/** Validation Payload d'une heure de fin : strictement après le début quand celui-ci est connu. */
export function validateEndTime(
  value: string | null | undefined,
  startTime: string | null | undefined,
): true | string {
  const base = validateTime(value)
  if (base !== true || !value) return base

  const start = toMinutes(startTime)
  const end = toMinutes(value)
  if (start !== null && end !== null && end <= start) {
    return "L'heure de fin doit suivre l'heure de début"
  }
  return true
}
