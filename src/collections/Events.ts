import type { Access, CollectionConfig, Where } from 'payload'
import { isAuthenticated, getUserTenantIDs } from '../access'
import { assignCreatedBy, isAdminOrCreator } from './hooks'

const publicOnly: Where = { visibility: { equals: 'public' } }

const readPublicOrOwnChurch: Access = ({ req: { user } }) => {
  if (!user) return publicOnly
  if ((user as { role?: string }).role === 'super-admin') return true
  const tenantIDs = getUserTenantIDs(user)
  if (tenantIDs.length === 0) return publicOnly
  return {
    or: [
      { visibility: { equals: 'public' } },
      { church: { in: tenantIDs } },
    ],
  }
}

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'time', 'visibility', 'createdBy', 'church'],
  },
  hooks: {
    beforeChange: [assignCreatedBy],
  },
  access: {
    read: readPublicOrOwnChurch,
    update: isAdminOrCreator,
    create: isAuthenticated,
    delete: isAdminOrCreator,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titre',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          label: 'Date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'dd/MM/yyyy',
            },
            width: '50%',
          },
        },
        {
          name: 'time',
          type: 'text',
          required: true,
          label: 'Heure',
          admin: {
            placeholder: 'HH:mm',
            width: '50%',
          },
          validate: (value: string | null | undefined) => {
            if (!value) return true
            if (!/^\d{2}:\d{2}$/.test(value)) {
              return 'Format attendu : HH:mm (ex: 20:00)'
            }
            const [h, m] = value.split(':').map(Number)
            if (h < 0 || h > 23 || m < 0 || m > 59) {
              return 'Heure invalide'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'room',
      type: 'relationship',
      relationTo: 'rooms',
      label: 'Salle',
      admin: {
        description: 'Salle utilisée pour cet événement (optionnel)',
      },
    },
    {
      name: 'location',
      type: 'text',
      label: 'Lieu',
      admin: {
        description: 'Lieu extérieur (si pas de salle sélectionnée)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image / Affiche',
      admin: {
        description: 'Image optionnelle pour illustrer l\'événement',
      },
    },
    {
      name: 'visibility',
      type: 'select',
      required: true,
      defaultValue: 'public',
      label: 'Visibilité',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Interne (membres)', value: 'internal' },
      ],
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
