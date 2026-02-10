import type { Access } from 'payload'

type UserWithRole = {
  role?: 'super-admin' | 'admin-church' | 'volunteer'
}

export const isSuperAdmin: Access = ({ req: { user } }) => {
  return (user as UserWithRole)?.role === 'super-admin'
}

export const isAdmin: Access = ({ req: { user } }) => {
  const role = (user as UserWithRole)?.role
  return role === 'super-admin' || role === 'admin-church'
}

export const isVolunteer: Access = ({ req: { user } }) => {
  return Boolean(user)
}
