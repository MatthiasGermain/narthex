import type { Access, CollectionBeforeChangeHook } from 'payload'

/** Auto-assigne le champ `createdBy` à l'utilisateur courant lors de la création. */
export const assignCreatedBy: CollectionBeforeChangeHook = ({ req, operation, data }) => {
  if (operation === 'create') {
    const user = req.user as { id?: number } | undefined
    if (user && !data.createdBy) {
      data.createdBy = user.id
    }
  }
  return data
}

/** Super-admin ou admin-church : accès total. Bénévole : uniquement ses propres ressources. */
export const isAdminOrCreator: Access = ({ req: { user } }) => {
  const u = user as { id?: number; role?: string } | undefined
  if (!u) return false
  if (u.role === 'super-admin' || u.role === 'admin-church') return true
  return { createdBy: { equals: u.id } }
}
