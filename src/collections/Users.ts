import type { CollectionConfig, FieldAccess } from 'payload'
import { isSuperAdmin, belongsToChurch, getUserTenantIDs } from '../access'

const updateScopedToTenant = ({ req: { user } }: { req: { user: unknown } }) => {
  if (!user) return false
  const u = user as { role?: string }
  if (u.role === 'super-admin') return true
  // admin-church can only update users in their own tenant
  const tenantIDs = getUserTenantIDs(user)
  if (tenantIDs.length === 0) return false
  return { 'tenants.tenant': { in: tenantIDs } }
}

const onlySuperAdminCanEditRole: FieldAccess = ({ req: { user } }) => {
  return (user as { role?: string })?.role === 'super-admin'
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 600000,
  },
  access: {
    read: belongsToChurch,
    create: isSuperAdmin,
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
        update: onlySuperAdminCanEditRole,
      },
    },
    // Le champ 'tenants' (array de {tenant: church_id}) est injecté
    // automatiquement par @payloadcms/plugin-multi-tenant
  ],
}
