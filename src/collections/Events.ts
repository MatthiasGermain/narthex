import type { Access, CollectionConfig, Where } from 'payload'
import { isAuthenticated, getUserTenantIDs } from '../access'
import { assignCreatedBy, isAdminOrCreator } from './hooks'
import { validateEndTime, validateTime } from '../lib/time'

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
      name: 'gathering',
      type: 'relationship',
      relationTo: 'gatherings',
      index: true,
      label: 'Fait partie de',
      admin: {
        description: 'Rattacher à un rassemblement (week-end d’église, convention…). Optionnel.',
      },
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
            width: '34%',
          },
        },
        {
          name: 'time',
          type: 'text',
          required: true,
          label: 'Début',
          admin: {
            placeholder: 'HH:mm',
            width: '33%',
          },
          validate: validateTime,
        },
        {
          name: 'endTime',
          type: 'text',
          label: 'Fin',
          admin: {
            placeholder: 'HH:mm',
            width: '33%',
            description: 'Optionnelle — sert à détecter les conflits de salle.',
          },
          validate: (
            value: string | null | undefined,
            { siblingData }: { siblingData?: { time?: string | null } },
          ) => validateEndTime(value, siblingData?.time),
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
      name: 'posterPdf',
      type: 'upload',
      relationTo: 'documents',
      label: 'Affiche en PDF',
      admin: {
        description: 'PDF optionnel, affiché sur la page de l\'événement',
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
