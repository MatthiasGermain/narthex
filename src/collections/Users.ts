import type {
  Access,
  CollectionAfterChangeHook,
  CollectionConfig,
  CollectionBeforeChangeHook,
  FieldAccess,
} from 'payload'
import { isSuperAdmin, isSuperAdminCheck, belongsToChurch, getUserTenantIDs } from '../access'

const updateScopedToTenant = ({ req: { user } }: { req: { user: unknown } }) => {
  if (!user) return false
  const u = user as { role?: string }
  if (u.role === 'super-admin') return true
  // admin-church can only update users in their own tenant
  const tenantIDs = getUserTenantIDs(user)
  if (tenantIDs.length === 0) return false
  return { 'tenants.tenant': { in: tenantIDs } }
}

const canEditRole: FieldAccess = ({ req: { user } }) => {
  const role = (user as { role?: string })?.role
  return role === 'super-admin' || role === 'admin-church'
}

// Allow admin-church to create user accounts (hook enforces volunteer-only)
const canCreateUser: Access = ({ req: { user } }) => {
  if (!user) return false
  const u = user as { role?: string }
  if (u.role === 'super-admin') return true
  if (u.role === 'admin-church') return true
  return false
}

// Enforce allowed roles: admin-church can set volunteer or admin-church, never super-admin
const enforceAllowedRole: CollectionBeforeChangeHook = async ({ req, operation, data, originalDoc }) => {
  const currentUser = req.user as { id?: number; role?: string } | undefined
  if (!currentUser) return data

  // Super-admins can do anything
  if (currentUser.role === 'super-admin') return data

  if (currentUser.role === 'admin-church') {
    if (operation === 'create') {
      // admin-church can create volunteer or admin-church, never super-admin
      if (data.role === 'super-admin') {
        data.role = 'volunteer'
      }
    }

    if (operation === 'update' && data.role !== undefined) {
      // Cannot change own role
      if (originalDoc?.id === currentUser.id) {
        delete data.role
        return data
      }

      // Cannot modify a super-admin's role
      if (originalDoc?.role === 'super-admin') {
        delete data.role
        return data
      }

      // Can only set volunteer or admin-church
      if (data.role === 'super-admin') {
        data.role = originalDoc?.role || 'volunteer'
      }
    }
  }

  return data
}

// Auto-assign the admin-church's tenant to newly created users
const assignTenantOnCreate: CollectionBeforeChangeHook = ({ req, operation, data }) => {
  if (operation === 'create') {
    const user = req.user as {
      role?: string
      tenants?: Array<{ tenant: number | string | { id: number | string } }>
    } | undefined
    if (user?.role === 'admin-church' && user.tenants?.length) {
      const tenantId = typeof user.tenants[0].tenant === 'object'
        ? user.tenants[0].tenant.id
        : user.tenants[0].tenant
      if (!data.tenants || data.tenants.length === 0) {
        data.tenants = [{ tenant: tenantId }]
      }
    }
  }
  return data
}

// Auto-create a Member entry when a new User is created (if not already linked)
const autoCreateMember: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  // Skip super-admins (they don't belong to a single church)
  if (doc.role === 'super-admin') return doc

  // Get the tenant ID from the new user's tenants array
  const tenants = doc.tenants as Array<{ tenant: number | string | { id: number | string } }> | undefined
  if (!tenants?.length) return doc

  const tenantId = Number(
    typeof tenants[0].tenant === 'object'
      ? (tenants[0].tenant as { id: number | string }).id
      : tenants[0].tenant,
  )

  // Check if a Member already exists linked to this user
  const existing = await req.payload.find({
    collection: 'members',
    where: { user: { equals: doc.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })

  if (existing.docs.length > 0) return doc

  // Extract name from email (fallback)
  const emailParts = (doc.email as string).split('@')[0].split('.')
  const firstName = emailParts[0]?.charAt(0).toUpperCase() + (emailParts[0]?.slice(1) || '')
  const lastName = emailParts[1]
    ? emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1)
    : ''

  await req.payload.create({
    collection: 'members',
    data: {
      firstName,
      lastName: lastName || firstName,
      email: doc.email as string,
      churchRole: 'membre',
      isActive: true,
      user: doc.id,
      church: tenantId,
    },
    overrideAccess: true,
    req,
  })

  return doc
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 600000,
    forgotPassword: {
      generateEmailSubject: () => 'Définissez votre mot de passe — Narthex',
      generateEmailHTML: async (args) => {
        const token = args?.token
        const user = args?.user
        const req = args?.req

        // Résoudre le custom domain de la church pour rediriger l'utilisateur
        let baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
        if (req && user?.tenants?.length) {
          const tenantId = typeof user.tenants[0].tenant === 'object'
            ? user.tenants[0].tenant.id
            : user.tenants[0].tenant
          if (tenantId) {
            const church = await req.payload.findByID({
              collection: 'churches',
              id: tenantId,
              depth: 0,
              overrideAccess: true,
            }).catch(() => null)
            const customDomain = church?.domain as string | undefined
            if (customDomain) {
              baseUrl = `https://${customDomain}`
            }
          }
        }

        const url = `${baseUrl}/login/reset-password?token=${token}`
        return `
          <h2>Bienvenue sur Narthex</h2>
          <p>Cliquez sur le lien ci-dessous pour définir votre mot de passe :</p>
          <p><a href="${url}">Définir mon mot de passe</a></p>
          <p>Ce lien expire dans 1 heure.</p>
          <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        `
      },
    },
  },
  hooks: {
    beforeChange: [enforceAllowedRole, assignTenantOnCreate],
    afterChange: [autoCreateMember],
  },
  access: {
    admin: ({ req }) => isSuperAdminCheck(req.user),
    read: belongsToChurch,
    create: canCreateUser,
    update: updateScopedToTenant,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      saveToJWT: true,
      label: 'Rôle',
      options: [
        { label: 'Super-Admin', value: 'super-admin' },
        { label: 'Admin Église', value: 'admin-church' },
        { label: 'Bénévole', value: 'volunteer' },
      ],
      defaultValue: 'volunteer',
      access: {
        update: canEditRole,
      },
    },
    // Le champ 'tenants' (array de {tenant: church_id}) est injecté
    // automatiquement par @payloadcms/plugin-multi-tenant
  ],
}
