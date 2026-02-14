import type { CollectionConfig } from 'payload'
import { isAdmin, isAuthenticated } from '../access'

export const ChurchBranding: CollectionConfig = {
  slug: 'church-branding',
  admin: {
    useAsTitle: 'id',
    group: 'Église',
    description: 'Charte graphique : logo, favicon et couleurs',
  },
  access: {
    read: isAuthenticated,
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
          admin: {
            description: 'Boutons, liens, accents (ex: #1a73e8)',
          },
        },
        {
          name: 'secondary',
          type: 'text',
          label: 'Couleur secondaire',
          admin: {
            description: 'Fonds secondaires, hover (ex: #e8e0f8)',
          },
        },
        {
          name: 'accent',
          type: 'text',
          label: 'Couleur d\'accent',
          admin: {
            description: 'Highlights, CTA (ex: #FCCA46). Défaut : Sunglow',
          },
        },
        {
          name: 'foreground',
          type: 'text',
          label: 'Couleur du texte',
          admin: {
            description: 'Texte principal (ex: #1e2952). Défaut : Raisin',
          },
        },
        {
          name: 'background',
          type: 'text',
          label: 'Couleur de fond',
          admin: {
            description: 'Fond de page (ex: #f4f0ec). Défaut : Cream',
          },
        },
      ],
    },
  ],
}
