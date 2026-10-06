import { resendAdapter } from '@payloadcms/email-resend'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import type { FieldAccess } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Churches } from './collections/Churches'
import { ChurchBranding } from './collections/ChurchBranding'
import { ChurchProfiles } from './collections/ChurchProfiles'
import { Events } from './collections/Events'
import { Rooms } from './collections/Rooms'
import { Members } from './collections/Members'
import { ServicePlans } from './collections/ServicePlans'
import { Sermons } from './collections/Sermons'
import { AudioMedia } from './collections/AudioMedia'
import { Documents } from './collections/Documents'
import { Invitations } from './collections/Invitations'
import { Groups } from './collections/Groups'
import { Gatherings } from './collections/Gatherings'
import { Suggestions } from './collections/Suggestions'
import { isSuperAdminCheck } from './access/roles'

/** Champs réservés au super-admin (contourné par overrideAccess côté serveur). */
const superAdminFieldAccess: FieldAccess = ({ req }) => isSuperAdminCheck(req.user)

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
  collections: [Users, Media, AudioMedia, Documents, Churches, ChurchBranding, ChurchProfiles, Events, Rooms, Members, ServicePlans, Sermons, Invitations, Groups, Gatherings, Suggestions],
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
  email: resendAdapter({
    defaultFromAddress: 'noreply@narthex.dev',
    defaultFromName: 'Narthex',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  plugins: [
    multiTenantPlugin({
      tenantsSlug: 'churches',
      tenantField: { name: 'church' },
      userHasAccessToAllTenants: (user) => isSuperAdminCheck(user),
      // Le plugin laisse `tenants` sans accès de champ par défaut : n'importe
      // quel compte pouvait alors s'ajouter une autre église en modifiant son
      // propre document. Les flux applicatifs passent par overrideAccess, qui
      // court-circuite l'accès de champ — seul l'appel HTTP direct est bloqué.
      tenantsArrayField: {
        arrayFieldAccess: {
          create: superAdminFieldAccess,
          update: superAdminFieldAccess,
        },
        tenantFieldAccess: {
          create: superAdminFieldAccess,
          update: superAdminFieldAccess,
        },
      },
      collections: {
        events: {
          customTenantField: true,
        },
        rooms: {
          customTenantField: true,
        },
        members: {
          customTenantField: true,
        },
        'service-plans': {
          customTenantField: true,
        },
        sermons: {
          customTenantField: true,
        },
        invitations: {
          customTenantField: true,
        },
        groups: {
          customTenantField: true,
        },
        gatherings: {
          customTenantField: true,
        },
        // Pour la suppression en cascade quand une église est supprimée
        suggestions: {
          customTenantField: true,
        },
        media: {},
        'audio-media': {},
        documents: {},
        'church-branding': {},
        'church-profiles': {},
      },
      useTenantsCollectionAccess: false,
      cleanupAfterTenantDelete: true,
    }),
  ],
})
