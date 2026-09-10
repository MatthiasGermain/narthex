import type { CollectionConfig } from 'payload'
import { isAdmin, readOwnChurch } from '../access'
import { assignCreatedBy } from './hooks'
import { validateEndTime, validateTime } from '../lib/time'

export const ServicePlans: CollectionConfig = {
  slug: 'service-plans',
  admin: {
    useAsTitle: 'date',
    group: 'Église',
    description: 'Plannings de culte : qui fait quoi chaque dimanche',
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
      label: 'Nom du culte',
      admin: {
        description: 'Optionnel. Ex : Culte de Noël, Baptêmes, Sainte Cène. Vide = « Culte ».',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Date du culte',
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'time',
          type: 'text',
          label: 'Début',
          admin: { placeholder: 'HH:mm', width: '33%' },
          validate: (
            value: string | null | undefined,
            { siblingData }: { siblingData?: { room?: unknown } },
          ) => {
            // Sans heure, un culte ne peut pas être placé dans la journée de la salle.
            if (!value && siblingData?.room) {
              return "Précisez l'heure de début pour réserver la salle"
            }
            return validateTime(value)
          },
        },
        {
          name: 'endTime',
          type: 'text',
          label: 'Fin',
          admin: { placeholder: 'HH:mm', width: '33%' },
          validate: (
            value: string | null | undefined,
            { siblingData }: { siblingData?: { time?: string | null } },
          ) => validateEndTime(value, siblingData?.time),
        },
        {
          name: 'room',
          type: 'relationship',
          relationTo: 'rooms',
          label: 'Salle',
          admin: { width: '34%' },
        },
      ],
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
      name: 'assignments',
      type: 'array',
      label: 'Affectations',
      admin: {
        description: 'Assignez des membres à chaque rôle pour ce culte',
      },
      fields: [
        {
          name: 'role',
          type: 'text',
          required: true,
          label: 'Rôle',
          admin: {
            description: 'Ex : Présidence, Louange, Sono...',
          },
        },
        {
          name: 'members',
          type: 'relationship',
          relationTo: 'members',
          hasMany: true,
          label: 'Membres assignés',
        },
        {
          name: 'group',
          type: 'relationship',
          relationTo: 'groups',
          label: 'Groupe assigné',
          admin: {
            description: 'Pour les rôles servis par un groupe entier (ex : Louange)',
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        description: 'Informations complémentaires pour ce dimanche',
        rows: 3,
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
