import type { Access } from 'payload'

type UserWithChurch = {
  role?: string
  church?: string | { id: string }
}

export const belongsToChurch: Access = ({ req: { user } }) => {
  const u = user as UserWithChurch
  if (u?.role === 'super-admin') return true
  const churchId = typeof u?.church === 'object' ? u?.church?.id : u?.church
  if (!churchId) return false
  return {
    church: { equals: churchId },
  }
}
