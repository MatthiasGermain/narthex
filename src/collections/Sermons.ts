import type { Access, CollectionConfig, Where } from 'payload'
import { isAuthenticated, getUserTenantIDs, ownChurchFilterOptions } from '../access'
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

export const Sermons: CollectionConfig = {
  slug: 'sermons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'preacher', 'series', 'visibility', 'church'],
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
          name: 'preacher',
          type: 'relationship',
          relationTo: 'members',
          label: 'Prédicateur',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'series',
      type: 'text',
      label: 'Série',
      admin: {
        description: 'Nom de la série de prédications (optionnel)',
      },
    },
    {
      name: 'scripture',
      type: 'text',
      label: 'Passage biblique',
      admin: {
        placeholder: 'Ex: Jean 3:16-21',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description / Résumé',
    },
    {
      name: 'audioFile',
      type: 'upload',
      relationTo: 'audio-media',
      label: 'Fichier audio',
      admin: {
        description: 'MP3 ou autre fichier audio de la prédication',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Lien vidéo',
      admin: {
        placeholder: 'https://youtube.com/watch?v=...',
        description: 'URL YouTube ou autre plateforme vidéo',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true
        if (!/^https?:\/\/.+/.test(value)) {
          return 'URL invalide (doit commencer par http:// ou https://)'
        }
        return true
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image / Couverture',
      admin: {
        description: 'Image optionnelle pour illustrer la prédication',
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
      filterOptions: ownChurchFilterOptions,
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
