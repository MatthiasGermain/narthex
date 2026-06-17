/**
 * Seed members for a specific church
 *
 * Usage:
 *   npx tsx scripts/seed-members.ts
 *
 * Target church is set via CHURCH_SLUG below.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const CHURCH_SLUG = 'church-test'

type ChurchRole = 'pasteur' | 'diacre' | 'ancien' | 'responsable' | 'membre' | 'visiteur'

const MEMBERS_DATA: { firstName: string; lastName: string; email: string; phone: string; churchRole: ChurchRole }[] = [
  { firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.com', phone: '0612345678', churchRole: 'membre' },
  { firstName: 'Marie', lastName: 'Martin', email: 'marie.martin@example.com', phone: '0623456789', churchRole: 'membre' },
  { firstName: 'Paul', lastName: 'Bernard', email: 'paul.bernard@example.com', phone: '0634567890', churchRole: 'membre' },
  { firstName: 'Sophie', lastName: 'Petit', email: 'sophie.petit@example.com', phone: '0645678901', churchRole: 'membre' },
  { firstName: 'Lucas', lastName: 'Robert', email: 'lucas.robert@example.com', phone: '0656789012', churchRole: 'membre' },
  { firstName: 'Emma', lastName: 'Richard', email: 'emma.richard@example.com', phone: '0667890123', churchRole: 'membre' },
  { firstName: 'Thomas', lastName: 'Moreau', email: 'thomas.moreau@example.com', phone: '0678901234', churchRole: 'membre' },
  { firstName: 'Camille', lastName: 'Simon', email: 'camille.simon@example.com', phone: '0689012345', churchRole: 'membre' },
  { firstName: 'Hugo', lastName: 'Laurent', email: 'hugo.laurent@example.com', phone: '0690123456', churchRole: 'membre' },
  { firstName: 'Léa', lastName: 'Michel', email: 'lea.michel@example.com', phone: '0601234567', churchRole: 'membre' },
]

async function seed() {
  const payload = await getPayload({ config })

  // 1. Find the target church by slug
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

  // 2. Create members
  let created = 0
  let skipped = 0

  for (const memberData of MEMBERS_DATA) {
    // Check if member already exists (by email + church)
    const { docs: existing } = await payload.find({
      collection: 'members',
      where: {
        and: [
          { email: { equals: memberData.email } },
          { church: { equals: church.id } },
        ],
      },
      limit: 1,
    })

    if (existing.length > 0) {
      console.log(`  Skipped (exists): ${memberData.firstName} ${memberData.lastName}`)
      skipped++
      continue
    }

    await payload.create({
      collection: 'members',
      data: {
        ...memberData,
        church: church.id,
        isActive: true,
      },
    })

    console.log(`  Created: ${memberData.firstName} ${memberData.lastName}`)
    created++
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
