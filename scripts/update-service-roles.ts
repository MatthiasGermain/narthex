/**
 * Réinitialise les rôles de culte (settings.serviceRoles) des églises
 * sur la nouvelle liste par défaut (DEFAULT_SERVICE_ROLES).
 *
 * Usage:
 *   npx tsx scripts/update-service-roles.ts            # toutes les églises
 *   npx tsx scripts/update-service-roles.ts church-test # une église par slug
 *
 * ⚠ Écrase les rôles personnalisés de l'église ciblée.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { DEFAULT_SERVICE_ROLES } from '../src/lib/service-roles'

const SLUG = process.argv[2] // optionnel

async function run() {
  const payload = await getPayload({ config })

  const { docs: churches } = await payload.find({
    collection: 'churches',
    where: SLUG ? { slug: { equals: SLUG } } : {},
    limit: 1000,
  })

  if (churches.length === 0) {
    console.error(SLUG ? `Aucune église avec le slug "${SLUG}".` : 'Aucune église trouvée.')
    process.exit(1)
  }

  for (const church of churches) {
    await payload.update({
      collection: 'churches',
      id: church.id,
      data: {
        settings: {
          ...(church.settings || {}),
          serviceRoles: DEFAULT_SERVICE_ROLES,
        },
      },
      overrideAccess: true,
    })
    console.log(`  Mis à jour: ${church.name} (${church.slug})`)
  }

  console.log(
    `\nTerminé. ${churches.length} église(s) → rôles: ${DEFAULT_SERVICE_ROLES.map((r) => r.label).join(', ')}`,
  )
  process.exit(0)
}

run().catch((err) => {
  console.error('Échec:', err)
  process.exit(1)
})
