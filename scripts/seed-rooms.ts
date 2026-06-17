/**
 * Seed rooms for a specific church
 *
 * Usage:
 *   npx tsx scripts/seed-rooms.ts
 *
 * Target church is set via CHURCH_SLUG below.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const CHURCH_SLUG = 'church-test'

type Equipment = 'projector' | 'sound' | 'piano' | 'wifi' | 'kitchen' | 'board'

const ROOMS_DATA: { name: string; capacity: number; floor: string; description: string; equipment: Equipment[]; accessibility: boolean }[] = [
  {
    name: 'Temple principal',
    capacity: 200,
    floor: 'RDC',
    description: 'Salle de culte principale avec estrade, baptistère et balcon.',
    equipment: ['projector', 'sound', 'piano', 'wifi'],
    accessibility: true,
  },
  {
    name: 'Salle polyvalente',
    capacity: 60,
    floor: 'RDC',
    description: 'Grande salle modulable pour repas, réunions et activités diverses.',
    equipment: ['projector', 'sound', 'wifi', 'kitchen'],
    accessibility: true,
  },
  {
    name: 'Salle jeunesse',
    capacity: 30,
    floor: '1er étage',
    description: 'Espace dédié aux activités jeunesse avec coin détente et jeux.',
    equipment: ['sound', 'wifi', 'board'],
    accessibility: false,
  },
  {
    name: 'Salle enfants',
    capacity: 20,
    floor: 'RDC',
    description: "Salle adaptée pour l'école du dimanche et les activités enfants.",
    equipment: ['board'],
    accessibility: true,
  },
  {
    name: 'Bureau pastoral',
    capacity: 8,
    floor: '1er étage',
    description: 'Bureau pour les réunions du conseil, entretiens pastoraux et petit comité.',
    equipment: ['wifi'],
    accessibility: false,
  },
]

async function seed() {
  const payload = await getPayload({ config })

  const { docs: churches } = await payload.find({
    collection: 'churches',
    where: { slug: { equals: CHURCH_SLUG } },
    limit: 1,
  })

  if (churches.length === 0) {
    console.error(`Church with slug "${CHURCH_SLUG}" not found.`)
    process.exit(1)
  }

  const church = churches[0]
  console.log(`Found church: ${church.name} (id: ${church.id})`)

  let created = 0
  let skipped = 0

  for (const roomData of ROOMS_DATA) {
    const { docs: existing } = await payload.find({
      collection: 'rooms',
      where: {
        and: [{ name: { equals: roomData.name } }, { church: { equals: church.id } }],
      },
      limit: 1,
    })

    if (existing.length > 0) {
      console.log(`  Skipped (exists): ${roomData.name}`)
      skipped++
      continue
    }

    await payload.create({
      collection: 'rooms',
      data: {
        ...roomData,
        church: church.id,
        isActive: true,
      },
      overrideAccess: true,
    })

    console.log(`  Created: ${roomData.name}`)
    created++
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
