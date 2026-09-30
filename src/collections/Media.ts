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
    // Pas de `image/*` : il accepte image/svg+xml, servi inline depuis l'origine
    // de l'app — un SVG est un document scriptable, donc un XSS stocké
    // uploadable par n'importe quel compte connecté.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
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
