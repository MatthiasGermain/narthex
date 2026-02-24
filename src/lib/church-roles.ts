export const CHURCH_ROLE_OPTIONS = [
  { label: 'Pasteur', value: 'pasteur' },
  { label: 'Diacre', value: 'diacre' },
  { label: 'Ancien', value: 'ancien' },
  { label: 'Responsable', value: 'responsable' },
  { label: 'Membre', value: 'membre' },
  { label: 'Ami / Visiteur régulier', value: 'visiteur' },
] as const

export const CHURCH_ROLE_LABELS: Record<string, string> = Object.fromEntries(
  CHURCH_ROLE_OPTIONS.map((opt) => [opt.value, opt.label]),
)
