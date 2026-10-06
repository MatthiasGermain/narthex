export const SUGGESTION_KINDS = [
  { value: 'probleme', label: 'Un problème' },
  { value: 'amelioration', label: 'Une amélioration' },
  { value: 'idee', label: 'Une nouvelle idée' },
] as const

export type SuggestionKind = (typeof SUGGESTION_KINDS)[number]['value']

export const SUGGESTION_KIND_LABELS: Record<string, string> = Object.fromEntries(
  SUGGESTION_KINDS.map((k) => [k.value, k.label]),
)

export const SUGGESTION_MIN_LENGTH = 10
export const SUGGESTION_MAX_LENGTH = 3000
