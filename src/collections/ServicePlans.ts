import type { CollectionConfig } from 'payload'
import { isAdmin, readOwnChurch } from '../access'
import { assignCreatedBy } from './hooks'

export const ServicePlans: CollectionConfig = {
  slug: 'service-plans',
  admin: {
    useAsTitle: 'date',
    group: 'Église',
    description: 'Plannings de culte : qui fait quoi chaque dimanche',
  },
  hooks: {
    beforeChange: [assignCreatedBy],
  },
  access: {
    read: readOwnChurch,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Date du culte',
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
      },
    },
    {
      name: 'assignments',
      type: 'array',
      label: 'Affectations',
      admin: {
        description: 'Assignez des membres à chaque rôle pour ce culte',
      },
      fields: [
        {
          name: 'role',
          type: 'text',
          required: true,
          label: 'Rôle',
          admin: {
            description: 'Ex : Présidence, Louange, Sono...',
          },
        },
        {
          name: 'members',
          type: 'relationship',
          relationTo: 'members',
          hasMany: true,
          label: 'Membres assignés',
        },
        {
          name: 'group',
          type: 'relationship',
          relationTo: 'groups',
          label: 'Groupe assigné',
          admin: {
            description: 'Pour les rôles servis par un groupe entier (ex : Louange)',
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        description: 'Informations complémentaires pour ce dimanche',
        rows: 3,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Créé par',
      admin: {
        readOnly: true,
        description: 'Auto-assigné au créateur',
      },
    },
    {
      name: 'church',
      type: 'relationship',
      relationTo: 'churches',
      required: true,
      index: true,
      label: 'Église',
      admin: {
        condition: (_, __, { user }) => user?.role === 'super-admin',
        description: 'Auto-assigné à votre église',
      },
    },
  ],
}
