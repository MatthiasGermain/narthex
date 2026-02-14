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
import { ChurchBranding } from './collections/ChurchBranding'
import { ChurchProfiles } from './collections/ChurchProfiles'
import { Events } from './collections/Events'
import { isSuperAdminCheck } from './access/roles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET env var is required')
}
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL env var is required')
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  cors: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [],
  csrf: process.env.CSRF_ORIGINS ? process.env.CSRF_ORIGINS.split(',') : [],
  admin: {
    user: Users.slug,
    meta: {
      title: 'Narthex Admin',
      icons: [{ url: '/narthex_favicon.png' }],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Churches, ChurchBranding, ChurchProfiles, Events],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
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
        'church-branding': {},
        'church-profiles': {},
      },
      useTenantsCollectionAccess: false,
      cleanupAfterTenantDelete: true,
    }),
  ],
})
