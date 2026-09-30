import type { CollectionConfig } from 'payload'
import { isAdmin, readOwnChurch, ownChurchFilterOptions, sameChurchFilterOptions } from '../access'
import { assignCreatedBy } from './hooks'

export const Groups: CollectionConfig = {
  slug: 'groups',
  admin: {
    useAsTitle: 'name',
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
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom du groupe',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: { rows: 3 },
    },
    {
      name: 'members',
      type: 'relationship',
      relationTo: 'members',
      filterOptions: sameChurchFilterOptions,
      hasMany: true,
      label: 'Membres',
    },
    {
      name: 'leader',
      type: 'relationship',
      relationTo: 'members',
      filterOptions: sameChurchFilterOptions,
      label: 'Responsable',
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Créé par',
      admin: { readOnly: true },
    },
    {
      name: 'church',
      type: 'relationship',
      relationTo: 'churches',
      filterOptions: ownChurchFilterOptions,
      required: true,
      index: true,
      label: 'Église',
      admin: { readOnly: true },
    },
  ],
}
