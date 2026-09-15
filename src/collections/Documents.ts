import type { CollectionConfig } from 'payload'
import { isAuthenticated, isAdmin } from '../access'

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: {
    singular: 'Document PDF',
    plural: 'Documents PDF',
  },
  typescript: {
    interface: 'PdfDocument',
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Description',
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, operation }) => {
        if (operation === 'create' && req.file) {
          const maxSize = 10 * 1024 * 1024 // 10 MB
          if (req.file.size > maxSize) {
            throw new Error('Le fichier dépasse la taille maximale de 10 Mo.')
          }
        }
      },
    ],
  },
  upload: {
    // Sous media/ : c'est le seul dossier monté en volume persistant en prod
    staticDir: 'media/documents',
    mimeTypes: ['application/pdf'],
  },
}
