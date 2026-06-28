import type { Access } from 'payload'

type UserWithRole = {
  role?: 'super-admin' | 'admin-church' | 'volunteer'
}

/** Plain boolean check — pour plugin config et helpers */
export function isSuperAdminCheck(user: unknown): boolean {
  return (user as UserWithRole)?.role === 'super-admin'
}

export const isSuperAdmin: Access = ({ req: { user } }) => {
  return isSuperAdminCheck(user)
}

/** Plain boolean check — pour les pages/composants (pas le contrôle d'accès Payload) */
export function isAdminRole(user: unknown): boolean {
  const role = (user as UserWithRole)?.role
  return role === 'super-admin' || role === 'admin-church'
}

export const isAdmin: Access = ({ req: { user } }) => {
  return isAdminRole(user)
}

/**
 * Un utilisateur peut-il supprimer un document possédé ?
 * Les admins peuvent tout supprimer ; sinon seul le créateur le peut.
 */
export function canDeleteOwned(
  doc: { createdBy?: number | { id: number } | null },
  userId: number,
  userRole: string,
): boolean {
  if (userRole === 'super-admin' || userRole === 'admin-church') return true
  const creatorId = typeof doc.createdBy === 'object' ? doc.createdBy?.id : doc.createdBy
  return creatorId === userId
}

export const isAuthenticated: Access = ({ req: { user } }) => {
  return Boolean(user)
}
