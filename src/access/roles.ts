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

export const isAdmin: Access = ({ req: { user } }) => {
  const role = (user as UserWithRole)?.role
  return role === 'super-admin' || role === 'admin-church'
}

export const isVolunteer: Access = ({ req: { user } }) => {
  return Boolean(user)
}
