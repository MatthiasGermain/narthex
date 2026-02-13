import type { Access, CollectionConfig, CollectionBeforeChangeHook } from 'payload'
import { isVolunteer } from '../access'

type UserWithId = {
  id?: number
  role?: string
}

const assignCreatedBy: CollectionBeforeChangeHook = ({ req, operation, data }) => {
  if (operation === 'create') {
    const user = req.user as UserWithId | undefined
    if (user && !data.createdBy) {
      data.createdBy = user.id
    }
  }
  return data
}

const isAdminOrCreator: Access = ({ req: { user } }) => {
  const u = user as UserWithId | undefined
  if (!u) return false
  if (u.role === 'super-admin' || u.role === 'admin-church') return true
  // Les bénévoles peuvent supprimer leurs propres événements
  return { createdBy: { equals: u.id } }
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
    // read et update : gérés par le plugin multi-tenant (auto-filtrage par église)
    create: isVolunteer,
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
      name: 'location',
      type: 'text',
      label: 'Lieu',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
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
      label: 'Église',
      admin: {
        condition: (_, __, { user }) => user?.role === 'super-admin',
        description: 'Auto-assigné à votre église',
      },
    },
  ],
}
