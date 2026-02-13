import type { CollectionConfig } from 'payload'
import { isSuperAdmin, isAdmin, belongsToChurch } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: belongsToChurch,
    create: isSuperAdmin,
    update: isAdmin,
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
    },
    // Le champ 'tenants' (array de {tenant: church_id}) est injecté
    // automatiquement par @payloadcms/plugin-multi-tenant
  ],
}
