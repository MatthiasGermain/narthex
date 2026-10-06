import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access'
import { SUGGESTION_KINDS } from '../lib/suggestions'

/**
 * Suggestions envoyées par les admins d'église depuis le dashboard.
 * Créées uniquement par l'action serveur (overrideAccess) : l'API HTTP reste
 * fermée à tous sauf au super-admin, qui les trie dans l'admin Payload.
 */
export const Suggestions: CollectionConfig = {
  slug: 'suggestions',
  labels: {
    singular: 'Suggestion',
    plural: 'Suggestions',
  },
  admin: {
    defaultColumns: ['kind', 'message', 'church', 'status', 'createdAt'],
  },
  access: {
    read: isSuperAdmin,
    create: isSuperAdmin,
    update: isSuperAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'nouvelle',
      label: 'Statut',
      options: [
        { label: 'Nouvelle', value: 'nouvelle' },
        { label: 'En cours', value: 'en-cours' },
        { label: 'Faite', value: 'faite' },
        { label: 'Écartée', value: 'ecartee' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      label: 'Type',
      options: SUGGESTION_KINDS.map((k) => ({ label: k.label, value: k.value })),
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'Message',
    },
    {
      name: 'page',
      type: 'text',
      label: 'Page',
    },
    {
      name: 'church',
      type: 'relationship',
      relationTo: 'churches',
      required: true,
      index: true,
      label: 'Église',
      admin: { readOnly: true },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Auteur',
      admin: { readOnly: true },
    },
  ],
}
