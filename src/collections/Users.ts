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
    {
      name: 'church',
      type: 'relationship',
      relationTo: 'churches',
      saveToJWT: true,
      label: 'Église',
      admin: {
        condition: (data) => data?.role !== 'super-admin',
        description: 'Église rattachée (obligatoire sauf Super-Admin)',
      },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => {
        if (siblingData?.role !== 'super-admin' && !value) {
          return 'Une église est obligatoire pour les rôles Admin Église et Bénévole.'
        }
        return true
      },
    },
  ],
}
