import { expect, test } from '@playwright/test'
import { api, countWhere, expectPageOk, futureDate, label } from './helpers'

/**
 * Bénévole : consulte tout ce qui relève de son église, crée des événements,
 * mais n'a pas la main sur les membres, les invitations ni les autres comptes.
 *
 * Les refus sont testés avec des requêtes sans effet si elles passaient à tort.
 */

const PAGES = [
  '/dashboard',
  '/dashboard/events',
  '/dashboard/events/new',
  '/dashboard/rooms',
  '/dashboard/members',
  '/dashboard/planning',
  '/dashboard/sermons',
  '/dashboard/groups',
  '/dashboard/gatherings',
  '/dashboard/calendar',
  '/dashboard/account',
]

const ADMIN_ONLY_PAGES = ['/dashboard/groups/new', '/dashboard/gatherings/new']

test('les pages du dashboard s’affichent', async ({ page }) => {
  test.setTimeout(10 * 60_000)
  for (const url of PAGES) {
    await expectPageOk(page, url)
  }
})

test('les pages réservées aux admins sont introuvables', async ({ page }) => {
  // On regarde ce qui s'affiche et non le statut HTTP : Next a déjà commencé
  // à envoyer la page quand `notFound()` est appelé, le statut reste 200.
  for (const url of ADMIN_ONLY_PAGES) {
    await page.goto(url, { waitUntil: 'networkidle' })
    await expect.soft(page.getByRole('heading', { name: '404' }), url).toBeVisible()
    await expect.soft(page.locator('form'), `${url} : formulaire affiché`).toHaveCount(0)
  }
})

test('créer un événement', async ({ page }) => {
  const title = label('Événement bénévole')
  await page.goto('/dashboard/events/new', { waitUntil: 'networkidle' })
  await page.locator('#title').fill(title)
  await page.locator('#date').fill(futureDate(32))
  await page.locator('#time').fill('14:00')

  await page.locator('#visibility').click()
  await page.getByRole('option', { name: /Interne/ }).click()

  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await page.waitForURL('**/dashboard/events')
  expect(await countWhere(page, 'events', 'title', title)).toBe(1)
})

test('les invitations sont illisibles', async ({ page }) => {
  await page.goto('/dashboard')
  const res = await api(page, 'GET', '/api/invitations?limit=1&depth=0')
  expect(res.status).toBe(403)
})

test('création de membre refusée', async ({ page }) => {
  await page.goto('/dashboard')
  const me = await api(page, 'GET', '/api/users/me')
  const church = me.json.user.tenants[0].tenant

  const res = await api(page, 'POST', '/api/members', {
    firstName: 'Test',
    lastName: label('Membre bénévole'),
    church: typeof church === 'object' ? church.id : church,
  })
  expect(res.status).toBe(403)
})

test('le compte d’un autre est intouchable', async ({ page }) => {
  await page.goto('/dashboard')
  const me = await api(page, 'GET', '/api/users/me')
  const users = await api(page, 'GET', '/api/users?limit=50&depth=0')
  expect(users.status).toBe(200)

  const other = (users.json.docs as { id: number }[]).find((u) => u.id !== me.json.user.id)
  test.skip(!other, 'aucun autre compte visible dans cette église')

  // Corps vide : aucune donnée modifiée même si la requête passait.
  const res = await api(page, 'PATCH', `/api/users/${other!.id}`, {})
  expect([403, 404]).toContain(res.status)
})

test('modifier son propre compte reste possible', async ({ page }) => {
  await page.goto('/dashboard')
  const me = await api(page, 'GET', '/api/users/me')
  const { id, email } = me.json.user

  const res = await api(page, 'PATCH', `/api/users/${id}`, { email })
  expect(res.status).toBe(200)
  expect(res.json.doc.role).toBe('volunteer')
})
