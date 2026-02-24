import type { CollectionConfig } from 'payload'
import { isAuthenticated, readOwnChurch } from '../access'
import { assignCreatedBy, isAdminOrCreator } from './hooks'

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
    read: readOwnChurch,
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
      index: true,
      label: 'Église',
      admin: {
        condition: (_, __, { user }) => user?.role === 'super-admin',
        description: 'Auto-assigné à votre église',
      },
    },
  ],
}
