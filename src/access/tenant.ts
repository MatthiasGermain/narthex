import type { Access } from 'payload'

type UserWithTenants = {
  role?: string
  tenants?: Array<{ tenant: string | number | { id: string | number } }>
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
