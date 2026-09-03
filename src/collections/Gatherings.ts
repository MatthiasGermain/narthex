import type { CollectionConfig } from 'payload'
import { isAdmin, readOwnChurch } from '../access'
import { assignCreatedBy } from './hooks'

/**
 * Un rassemblement chapeaute plusieurs éléments du calendrier sur une période :
 * week-end d'église, convention, semaine de prière, retraite. Il accepte aussi
 * bien des événements que des cultes — c'est tout l'intérêt d'une collection
 * parente plutôt qu'un lien d'événement à événement.
 *
 * Le rattachement se fait depuis l'enfant, via son champ `gathering`.
 */
export const Gatherings: CollectionConfig = {
  slug: 'gatherings',
  labels: {
    singular: 'Rassemblement',
    plural: 'Rassemblements',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Église',
    description:
      'Regroupe plusieurs événements et, si besoin, un ou plusieurs cultes sur une même période.',
    defaultColumns: ['title', 'startDate', 'endDate', 'church'],
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
      name: 'title',
      type: 'text',
      required: true,
      label: 'Nom du rassemblement',
      admin: {
        description: "Ex : Week-end d'église, Convention de printemps, Semaine de prière.",
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          label: 'Du',
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
            width: '50%',
          },
        },
        {
          name: 'endDate',
          type: 'date',
          required: true,
          label: 'Au',
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'location',
      type: 'text',
      label: 'Lieu',
      admin: {
        description: 'Lieu commun à tout le rassemblement, si différent de l’église.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: { rows: 3 },
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
