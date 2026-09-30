import { expect, test } from '@playwright/test'
import { api, expectPageOk, futureDate, label } from './helpers'

/** Visiteur non connecté : le site public s'affiche, l'API interne est fermée. */

const PUBLIC_PAGES = ['/', '/events', '/sermons', '/about', '/visit', '/contact', '/login']

/** Collections qu'un visiteur ne doit pas pouvoir lister. */
const CLOSED_COLLECTIONS = [
  'users',
  'members',
  'invitations',
  'rooms',
  'service-plans',
  'groups',
  'gatherings',
  'churches',
  'church-branding',
]

test('les pages publiques s’affichent', async ({ page }) => {
  for (const url of PUBLIC_PAGES) {
    await expectPageOk(page, url)
  }
})

test('le dashboard renvoie vers la connexion', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})

test('les collections internes sont fermées', async ({ page }) => {
  await page.goto('/login')
  for (const collection of CLOSED_COLLECTIONS) {
    const res = await api(page, 'GET', `/api/${collection}?limit=1&depth=0`)
    expect.soft(res.status, `GET /api/${collection}`).toBe(403)
  }
})

test('événements et prédications : uniquement le public de cette église', async ({ page }) => {
  await page.goto('/login')
  for (const collection of ['events', 'sermons']) {
    const res = await api(page, 'GET', `/api/${collection}?limit=100&depth=0`)
    expect(res.status, `GET /api/${collection}`).toBe(200)

    const docs = res.json.docs as { visibility?: string; church?: number }[]
    expect
      .soft(
        docs.filter((d) => d.visibility !== 'public'),
        `${collection} : contenus internes exposés`,
      )
      .toEqual([])
    expect
      .soft(new Set(docs.map((d) => d.church)).size, `${collection} : plusieurs églises exposées`)
      .toBeLessThanOrEqual(1)
  }
})

test('profils d’église : une seule église visible', async ({ page }) => {
  await page.goto('/login')
  const res = await api(page, 'GET', '/api/church-profiles?limit=100&depth=0')
  expect(res.status).toBe(200)
  const churches = new Set((res.json.docs as { church?: number }[]).map((d) => d.church))
  expect(churches.size).toBeLessThanOrEqual(1)
})

test('création refusée sans connexion', async ({ page }) => {
  await page.goto('/login')
  // Titre marqué : si la création passait à tort, le nettoyage la retirerait.
  const res = await api(page, 'POST', '/api/events', {
    title: label('Événement anonyme'),
    date: futureDate(30),
    time: '10:00',
    visibility: 'internal',
  })
  expect(res.status).toBe(403)
})
