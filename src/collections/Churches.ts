import type { CollectionConfig, CollectionBeforeValidateHook } from 'payload'
import { isSuperAdmin, readOwnChurchById } from '../access'
import { DEFAULT_SERVICE_ROLES } from '../lib/service-roles'
import { validateEndTime, validateTime } from '../lib/time'
import { cacheTags, safeRevalidateTag } from '../lib/cache'

function revalidateChurch(doc?: { slug?: string | null; domain?: string | null } | null) {
  if (doc?.slug) safeRevalidateTag(cacheTags.churchSlug(doc.slug))
  if (doc?.domain) safeRevalidateTag(cacheTags.churchDomain(doc.domain))
}

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
    afterChange: [
      ({ doc, previousDoc }) => {
        revalidateChurch(doc)
        // Si le slug/domaine a changé, invalider aussi l'ancien
        if (previousDoc && (previousDoc.slug !== doc?.slug || previousDoc.domain !== doc?.domain)) {
          revalidateChurch(previousDoc)
        }
      },
    ],
    afterDelete: [({ doc }) => revalidateChurch(doc)],
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
      name: 'domain',
      type: 'text',
      label: 'Domaine',
      admin: {
        description: 'Domaine personnalisé pour ce tenant (ex: mon-eglise.fr)',
      },
    },
    {
      name: 'planningShareToken',
      type: 'text',
      index: true,
      label: 'Token de partage du planning',
      admin: {
        readOnly: true,
        description: 'Lien public en lecture seule du planning. Généré/révoqué depuis le dashboard.',
      },
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
        {
          type: 'row',
          fields: [
            {
              name: 'defaultServiceTime',
              type: 'text',
              label: 'Début des cultes',
              admin: {
                placeholder: 'HH:mm',
                width: '33%',
                description: 'Pré-rempli à la création d’un culte',
              },
              validate: validateTime,
            },
            {
              name: 'defaultServiceEndTime',
              type: 'text',
              label: 'Fin des cultes',
              admin: { placeholder: 'HH:mm', width: '33%' },
              validate: (
                value: string | null | undefined,
                { siblingData }: { siblingData?: { defaultServiceTime?: string | null } },
              ) => validateEndTime(value, siblingData?.defaultServiceTime),
            },
            {
              name: 'defaultServiceRoom',
              type: 'relationship',
              relationTo: 'rooms',
              label: 'Salle des cultes',
              admin: { width: '34%' },
            },
          ],
        },
      ],
    },
  ],
}
