/** Nombre d'éléments par page dans les listes du dashboard. */
export const PAGE_SIZE = 25

/** Une liste à venir reste naturellement bornée : on la charge d'un bloc. */
export const UPCOMING_LIMIT = 200

export type SearchParams = Record<string, string | string[] | undefined>

/** Lit un numéro de page dans l'URL, en retombant sur 1 si la valeur est absurde. */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  const page = Number(raw)
  return Number.isInteger(page) && page > 0 ? page : 1
}

/**
 * Lien vers une page en conservant les autres paramètres de l'URL — filtres,
 * onglet courant, et la pagination d'une éventuelle seconde liste.
 */
export function pageHref(
  basePath: string,
  searchParams: SearchParams,
  param: string,
  page: number,
): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === param || value == null) continue
    for (const v of Array.isArray(value) ? value : [value]) params.append(key, v)
  }

  // La page 1 est l'état par défaut : inutile de l'écrire dans l'URL.
  if (page > 1) params.set(param, String(page))

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}
