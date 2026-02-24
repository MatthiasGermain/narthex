import type { CollectionConfig, CollectionBeforeValidateHook } from 'payload'
import { isSuperAdmin, readOwnChurchById } from '../access'
import { DEFAULT_SERVICE_ROLES } from '../lib/service-roles'

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const generateSlug: CollectionBeforeValidateHook = ({ data }) => {
  if (data && !data.slug && data.name) {
    data.slug = slugify(data.name)
  }
  return data
}

export const Churches: CollectionConfig = {
  slug: 'churches',
  admin: {
    useAsTitle: 'name',
  },
  hooks: {
    beforeValidate: [generateSlug],
  },
  access: {
    read: readOwnChurchById,
    create: isSuperAdmin,
    update: isSuperAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Slug (URL)',
      admin: {
        description: 'Identifiant URL unique (ex: eglise-spotlight)',
      },
    },
    {
      name: 'domains',
      type: 'array',
      label: 'Domaines',
      admin: {
        description: 'Domaines et sous-domaines autorisés pour ce tenant',
      },
      fields: [
        {
          name: 'domain',
          type: 'text',
          required: true,
          label: 'Domaine',
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Paramètres',
      fields: [
        {
          name: 'enabledModules',
          type: 'select',
          hasMany: true,
          label: 'Modules activés',
          options: [
            { label: 'Événements', value: 'events' },
          ],
          defaultValue: ['events'],
        },
        {
          name: 'serviceRoles',
          type: 'array',
          label: 'Rôles de culte',
          admin: {
            description: 'Rôles assignables dans les plannings de culte (présidence, louange, etc.)',
          },
          defaultValue: DEFAULT_SERVICE_ROLES,
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Nom du rôle',
            },
          ],
        },
      ],
    },
  ],
}
