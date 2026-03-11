import type { CollectionConfig } from 'payload'
import { isAuthenticated, isAdmin } from '../access'

export const AudioMedia: CollectionConfig = {
  slug: 'audio-media',
  labels: {
    singular: 'Fichier audio',
    plural: 'Fichiers audio',
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
          const maxSize = 50 * 1024 * 1024 // 50 MB
          if (req.file.size > maxSize) {
            throw new Error('Le fichier dépasse la taille maximale de 50 Mo.')
          }
        }
      },
    ],
  },
  upload: {
    mimeTypes: ['audio/*'],
  },
}
