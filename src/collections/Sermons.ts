import type { CollectionConfig } from 'payload'
import {
  isAuthenticated,
  ownChurchFilterOptions,
  readPublicOrOwnChurch,
  sameChurchFilterOptions,
} from '../access'
import { assignCreatedBy, isAdminOrCreator } from './hooks'

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
          filterOptions: sameChurchFilterOptions,
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
      filterOptions: sameChurchFilterOptions,
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
      filterOptions: sameChurchFilterOptions,
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
