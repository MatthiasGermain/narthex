import type { Access, CollectionConfig, CollectionBeforeChangeHook } from 'payload'
import { isAuthenticated } from '../access'

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
  return { createdBy: { equals: u.id } }
}

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'capacity', 'floor', 'isActive', 'church'],
  },
  hooks: {
    beforeChange: [assignCreatedBy],
  },
  access: {
    read: isAuthenticated,
    update: isAdminOrCreator,
    create: isAuthenticated,
    delete: isAdminOrCreator,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom de la salle',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'capacity',
          type: 'number',
          label: 'Capacité (personnes)',
          min: 1,
          admin: { width: '50%' },
        },
        {
          name: 'floor',
          type: 'text',
          label: 'Étage / Localisation',
          admin: {
            placeholder: 'Ex: RDC, 1er étage, Sous-sol',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'equipment',
      type: 'select',
      hasMany: true,
      label: 'Équipements',
      options: [
        { label: 'Vidéoprojecteur', value: 'projector' },
        { label: 'Sono / Enceintes', value: 'sound' },
        { label: 'Piano', value: 'piano' },
        { label: 'Wi-Fi', value: 'wifi' },
        { label: 'Cuisine', value: 'kitchen' },
        { label: 'Tableau / Écran', value: 'board' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo de la salle',
    },
    {
      name: 'accessibility',
      type: 'checkbox',
      label: 'Accessible PMR',
      defaultValue: false,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Salle disponible',
      defaultValue: true,
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
