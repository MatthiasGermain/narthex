import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Churches } from './collections/Churches'
import { Events } from './collections/Events'
import { isSuperAdminCheck } from './access/roles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Churches, Events],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    multiTenantPlugin({
      tenantsSlug: 'churches',
      tenantField: { name: 'church' },
      userHasAccessToAllTenants: (user) => isSuperAdminCheck(user),
      collections: {
        events: {
          customTenantField: true,
        },
        media: {},
      },
      useTenantsCollectionAccess: false,
      cleanupAfterTenantDelete: true,
    }),
  ],
})
