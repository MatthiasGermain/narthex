import type { CollectionConfig } from 'payload'
import { isAdmin, readOwnChurch } from '../access'
import { CHURCH_ROLE_OPTIONS } from '../lib/church-roles'
import { assignCreatedBy } from './hooks'

export const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    useAsTitle: 'lastName',
    defaultColumns: ['lastName', 'firstName', 'email', 'churchRole', 'church'],
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
      type: 'row',
      fields: [
        {
          name: 'firstName',
          type: 'text',
          required: true,
          label: 'Prénom',
          admin: { width: '50%' },
        },
        {
          name: 'lastName',
          type: 'text',
          required: true,
          label: 'Nom',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          admin: { width: '50%' },
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Téléphone',
          admin: {
            placeholder: '06 12 34 56 78',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'churchRole',
      type: 'select',
      label: 'Rôle dans l\'église',
      options: [...CHURCH_ROLE_OPTIONS],
      defaultValue: 'membre',
    },
    {
      name: 'birthDate',
      type: 'date',
      label: 'Date de naissance',
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'Compte utilisateur',
      admin: {
        description: 'Lier ce membre à un compte utilisateur Narthex (optionnel)',
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
