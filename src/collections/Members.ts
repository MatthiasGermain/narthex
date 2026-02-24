import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'
import { isAuthenticated, isAdmin } from '../access'

const assignCreatedBy: CollectionBeforeChangeHook = ({ req, operation, data }) => {
  if (operation === 'create') {
    const user = req.user as { id?: number } | undefined
    if (user && !data.createdBy) {
      data.createdBy = user.id
    }
  }
  return data
}

export const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    useAsTitle: 'lastName',
    defaultColumns: ['lastName', 'firstName', 'email', 'churchRole', 'isActive', 'church'],
  },
  hooks: {
    beforeChange: [assignCreatedBy],
  },
  access: {
    read: isAuthenticated,
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
      options: [
        { label: 'Pasteur', value: 'pasteur' },
        { label: 'Diacre', value: 'diacre' },
        { label: 'Ancien', value: 'ancien' },
        { label: 'Responsable', value: 'responsable' },
        { label: 'Membre', value: 'membre' },
        { label: 'Ami / Visiteur régulier', value: 'visiteur' },
      ],
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
      name: 'isActive',
      type: 'checkbox',
      label: 'Membre actif',
      defaultValue: true,
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
      label: 'Église',
      admin: {
        condition: (_, __, { user }) => user?.role === 'super-admin',
        description: 'Auto-assigné à votre église',
      },
    },
  ],
}
