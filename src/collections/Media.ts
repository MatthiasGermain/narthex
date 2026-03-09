import type { CollectionConfig } from 'payload'
import { isAuthenticated, isAdmin } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
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
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, operation }) => {
        if (operation === 'create' && req.file) {
          const maxSize = 5 * 1024 * 1024 // 5 MB
          if (req.file.size > maxSize) {
            throw new Error('Le fichier dépasse la taille maximale de 5 Mo.')
          }
        }
      },
    ],
  },
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
}
