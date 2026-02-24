import type { CollectionConfig } from 'payload'
import { isAdmin, readOwnChurch } from '../access'

const validateHexColor = (value: string | null | undefined) => {
  if (!value) return true
  if (!/^#[0-9a-fA-F]{3,8}$/.test(value)) return 'Format attendu : #hex (ex: #1a73e8)'
  return true
}

export const ChurchBranding: CollectionConfig = {
  slug: 'church-branding',
  admin: {
    useAsTitle: 'id',
    group: 'Église',
    description: 'Charte graphique : logo, favicon et couleurs',
  },
  access: {
    read: readOwnChurch,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
      admin: {
        description: 'Logo principal (PNG/SVG, fond transparent, min 200×60)',
      },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      label: 'Favicon / Pictogramme',
      admin: {
        description: 'Icône carrée pour l\'onglet navigateur (PNG/SVG, 192×192 recommandé)',
      },
    },
    {
      name: 'colors',
      type: 'group',
      label: 'Couleurs',
      fields: [
        {
          name: 'primary',
          type: 'text',
          label: 'Couleur primaire',
          validate: validateHexColor,
          admin: {
            description: 'Boutons, liens, accents (ex: #1a73e8)',
          },
        },
        {
          name: 'secondary',
          type: 'text',
          label: 'Couleur secondaire',
          validate: validateHexColor,
          admin: {
            description: 'Fonds secondaires, hover (ex: #e8e0f8)',
          },
        },
        {
          name: 'accent',
          type: 'text',
          label: 'Couleur d\'accent',
          validate: validateHexColor,
          admin: {
            description: 'Highlights, CTA (ex: #FCCA46). Défaut : Sunglow',
          },
        },
        {
          name: 'foreground',
          type: 'text',
          label: 'Couleur du texte',
          validate: validateHexColor,
          admin: {
            description: 'Texte principal (ex: #1e2952). Défaut : Raisin',
          },
        },
        {
          name: 'background',
          type: 'text',
          label: 'Couleur de fond',
          validate: validateHexColor,
          admin: {
            description: 'Fond de page (ex: #f4f0ec). Défaut : Cream',
          },
        },
      ],
    },
  ],
}
