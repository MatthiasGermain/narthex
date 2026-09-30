import type { Access, FilterOptions } from 'payload'

type UserWithTenants = {
  role?: string
  tenants?: Array<{ tenant: string | number | { id: string | number } }>
}

/**
 * `filterOptions` du champ `church` des collections en `customTenantField`.
 *
 * Payload n'applique aucune contrainte `where` à la création (executeAccess ne
 * teste que la véracité du résultat), et le plugin multi-tenant ne pose son
 * propre garde-fou que sur le champ tenant qu'il injecte lui-même. C'est donc
 * ici que se joue l'isolation à la création : sans cela, n'importe quel compte
 * peut poster `church: <autre église>`.
 *
 * Attention : contrairement à l'access control, `filterOptions` est validé même
 * quand l'appelant passe `overrideAccess: true`. L'absence de `req.user` signale
 * un appel serveur de confiance (acceptation d'invitation, hooks internes) et
 * doit rester permissive, sinon ces flux cassent.
 */
export const ownChurchFilterOptions: FilterOptions = ({ req }) => {
  const user = req.user as UserWithTenants | undefined
  if (!user || user.role === 'super-admin') return true
  const tenantIDs = getUserTenantIDs(user)
  if (tenantIDs.length === 0) return false
  return { id: { in: tenantIDs } }
}

/**
 * `filterOptions` des relations internes à une église : la salle d'un
 * événement, les membres d'un groupe, le média d'une fiche…
 *
 * On se cale sur l'église du document lui-même quand elle est connue — Payload
 * fusionne le document d'origine dans `data`, elle l'est donc à la mise à jour —
 * ce qui vaut aussi pour un super-admin. À la création d'un document sans
 * `church`, on retombe sur les églises du compte.
 */
export const sameChurchFilterOptions: FilterOptions = ({ req, data }) => {
  const raw = (data as { church?: unknown } | undefined)?.church
  const docChurch = typeof raw === 'object' && raw !== null ? (raw as { id?: unknown }).id : raw
  if (typeof docChurch === 'number' || typeof docChurch === 'string') {
    return { church: { equals: docChurch } }
  }

  const user = req.user as UserWithTenants | undefined
  if (!user || user.role === 'super-admin') return true
  const tenantIDs = getUserTenantIDs(user)
  if (tenantIDs.length === 0) return false
  return { church: { in: tenantIDs } }
}

/**
 * Extrait les IDs de tenants (églises) depuis user.tenants[].
 */
export function getUserTenantIDs(user: unknown): (string | number)[] {
  const u = user as UserWithTenants
  if (!u?.tenants || !Array.isArray(u.tenants)) return []
  return u.tenants
    .map((t) => (typeof t.tenant === 'object' ? t.tenant?.id : t.tenant))
    .filter(Boolean) as (string | number)[]
}

/**
 * Access filter pour Users : les non-super-admins ne voient
 * que les users partageant au moins un tenant.
 */
export const belongsToChurch: Access = ({ req: { user } }) => {
  const u = user as UserWithTenants
  if (u?.role === 'super-admin') return true
  const tenantIDs = getUserTenantIDs(user)
  if (tenantIDs.length === 0) return false
  return {
    'tenants.tenant': { in: tenantIDs },
  }
}

/**
 * Access filter pour les collections tenant-scoped (rooms, members, media, etc.)
 * Filtre par le champ `church` au lieu de `tenants.tenant`.
 */
export const readOwnChurch: Access = ({ req: { user } }) => {
  if (!user) return false
  const u = user as UserWithTenants
  if (u?.role === 'super-admin') return true
  const tenantIDs = getUserTenantIDs(user)
  if (tenantIDs.length === 0) return false
  return { church: { in: tenantIDs } }
}

/**
 * Access filter pour la collection Churches elle-même.
 * Un utilisateur ne peut lire que les églises auxquelles il appartient (via id).
 */
export const readOwnChurchById: Access = ({ req: { user } }) => {
  if (!user) return false
  const u = user as UserWithTenants
  if (u?.role === 'super-admin') return true
  const tenantIDs = getUserTenantIDs(user)
  if (tenantIDs.length === 0) return false
  return { id: { in: tenantIDs } }
}
