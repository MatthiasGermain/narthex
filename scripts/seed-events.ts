/**
 * Seed events for a specific church
 *
 * Usage:
 *   npx tsx scripts/seed-rooms.ts    (run first!)
 *   npx tsx scripts/seed-events.ts
 *
 * Target church is set via CHURCH_SLUG below.
 * Events reference rooms by name -- rooms must exist first.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const CHURCH_SLUG = 'church-test'

function futureDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().split('T')[0]
}

// room: nom de la salle (sera resolu en ID), null = lieu exterieur via location
type Visibility = 'public' | 'internal'

const EVENTS_DATA: { title: string; date: string; time: string; room: string | null; location?: string; description: string; visibility: Visibility }[] = [
  {
    title: 'Culte du dimanche',
    date: futureDate(0),
    time: '10:00',
    room: 'Temple principal',
    description: "Culte dominical ouvert a tous. Louange, predication et communion fraternelle.",
    visibility: 'public',
  },
  {
    title: 'Groupe de priere',
    date: futureDate(2),
    time: '19:30',
    room: 'Salle polyvalente',
    description: "Temps de priere communautaire. Venez avec vos sujets de priere.",
    visibility: 'internal',
  },
  {
    title: 'Etude biblique - Epitre aux Romains',
    date: futureDate(4),
    time: '20:00',
    room: 'Salle polyvalente',
    description: "Suite de notre etude du livre des Romains, chapitres 5 a 8. Apportez votre Bible !",
    visibility: 'public',
  },
  {
    title: 'Repetition louange',
    date: futureDate(5),
    time: '18:00',
    room: 'Temple principal',
    description: "Repetition pour l'equipe de louange. Merci de preparer les chants envoyes par email.",
    visibility: 'internal',
  },
  {
    title: 'Brunch communautaire',
    date: futureDate(7),
    time: '11:30',
    room: 'Salle polyvalente',
    description: "Brunch partage apres le culte. Chacun apporte un plat sucre ou sale a partager.",
    visibility: 'public',
  },
  {
    title: 'Reunion du conseil',
    date: futureDate(10),
    time: '19:00',
    room: 'Bureau pastoral',
    description: "Reunion mensuelle du conseil d'eglise. Ordre du jour envoye par email.",
    visibility: 'internal',
  },
  {
    title: 'Soiree jeunes',
    date: futureDate(12),
    time: '19:00',
    room: 'Salle jeunesse',
    description: "Soiree pour les 15-25 ans. Jeux, louange et partage. Invitez vos amis !",
    visibility: 'public',
  },
  {
    title: 'Atelier enfants - Histoires de la Bible',
    date: futureDate(15),
    time: '14:00',
    room: 'Salle enfants',
    description: "Activites manuelles et histoires bibliques pour les 4-10 ans.",
    visibility: 'public',
  },
  {
    title: 'Concert de louange',
    date: futureDate(21),
    time: '19:30',
    room: 'Temple principal',
    description: "Soiree de louange et d'adoration ouverte a tous. Entree libre.",
    visibility: 'public',
  },
  {
    title: 'Formation accueil nouveaux visiteurs',
    date: futureDate(18),
    time: '10:00',
    room: 'Bureau pastoral',
    description: "Formation pour l'equipe d'accueil. Comment bien accueillir les nouveaux venus.",
    visibility: 'internal',
  },
  {
    title: 'Sortie paroissiale - Randonnee',
    date: futureDate(28),
    time: '09:00',
    room: null,
    location: "Foret de Fontainebleau - RDV parking de l'eglise",
    description: "Randonnee en foret suivie d'un pique-nique. Prevoir de bonnes chaussures !",
    visibility: 'public',
  },
  {
    title: 'Journee de jeune et priere',
    date: futureDate(14),
    time: '08:00',
    room: 'Temple principal',
    description: "Journee entiere consacree au jeune et a la priere. Programme disponible a l'accueil.",
    visibility: 'public',
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

  // Charger toutes les salles de cette eglise
  const { docs: rooms } = await payload.find({
    collection: 'rooms',
    where: { church: { equals: church.id } },
    limit: 100,
    overrideAccess: true,
  })

  const roomMap = new Map(rooms.map((r) => [r.name, r.id]))
  console.log(`Found ${rooms.length} rooms: ${[...roomMap.keys()].join(', ')}`)

  let created = 0
  let skipped = 0

  for (const eventData of EVENTS_DATA) {
    const { docs: existing } = await payload.find({
      collection: 'events',
      where: {
        and: [
          { title: { equals: eventData.title } },
          { church: { equals: church.id } },
        ],
      },
      limit: 1,
    })

    if (existing.length > 0) {
      console.log(`  Skipped (exists): ${eventData.title}`)
      skipped++
      continue
    }

    const { room: roomName, ...rest } = eventData
    const roomId = roomName ? roomMap.get(roomName) : undefined

    if (roomName && !roomId) {
      console.log(`  Warning: room "${roomName}" not found, creating without room: ${eventData.title}`)
    }

    await payload.create({
      collection: 'events',
      data: {
        ...rest,
        room: roomId || undefined,
        church: church.id,
      },
      overrideAccess: true,
    })

    console.log(`  Created: ${eventData.title}${roomId ? ` (${roomName})` : ''}`)
    created++
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
