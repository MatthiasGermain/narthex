import { expect, test } from '@playwright/test'
import { api, countWhere, expectPageOk, futureDate, label, PNG } from './helpers'

/** Admin d'église : toutes les pages s'ouvrent et les créations passent par les formulaires. */

const PAGES = [
  '/dashboard',
  '/dashboard/events',
  '/dashboard/events/new',
  '/dashboard/rooms',
  '/dashboard/rooms/new',
  '/dashboard/members',
  '/dashboard/members/new',
  '/dashboard/members/import',
  '/dashboard/planning',
  '/dashboard/planning/new',
  '/dashboard/sermons',
  '/dashboard/sermons/new',
  '/dashboard/groups',
  '/dashboard/groups/new',
  '/dashboard/gatherings',
  '/dashboard/gatherings/new',
  '/dashboard/invitations',
  '/dashboard/calendar',
  '/dashboard/profile',
  '/dashboard/account',
]

test('toutes les pages du dashboard s’affichent', async ({ page }) => {
  test.setTimeout(10 * 60_000)
  for (const url of PAGES) {
    await expectPageOk(page, url)
  }
})

test('créer une salle, avec une photo', async ({ page }) => {
  const name = label('Salle')
  await page.goto('/dashboard/rooms/new', { waitUntil: 'networkidle' })
  await page.locator('#name').fill(name)
  await page.locator('#capacity').fill('12')

  // La photo reprend le nom de la salle comme description : elle est marquée elle aussi.
  const [upload] = await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/api/media') && r.request().method() === 'POST',
    ),
    page
      .locator('input[type="file"]')
      .setInputFiles({ name: 'test-e2e.png', mimeType: 'image/png', buffer: PNG }),
  ])
  expect(upload.status(), 'upload de la photo').toBe(201)
  await expect(page.getByAltText('Preview')).toBeVisible()

  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await page.waitForURL('**/dashboard/rooms')
  await expect(page.getByText(name)).toBeVisible()
})

test('créer un événement', async ({ page }) => {
  const title = label('Événement')
  await page.goto('/dashboard/events/new', { waitUntil: 'networkidle' })
  await page.locator('#title').fill(title)
  await page.locator('#date').fill(futureDate(30))
  await page.locator('#time').fill('10:00')
  await page.locator('#endTime').fill('11:00')

  // Interne : la base est celle de la prod, l'événement ne doit pas paraître sur le site.
  await page.locator('#visibility').click()
  await page.getByRole('option', { name: /Interne/ }).click()

  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await page.waitForURL('**/dashboard/events')
  expect(await countWhere(page, 'events', 'title', title)).toBe(1)
})

test('créer un membre', async ({ page }) => {
  const lastName = label('Membre')
  await page.goto('/dashboard/members/new', { waitUntil: 'networkidle' })
  await page.locator('#firstName').fill('Test')
  await page.locator('#lastName').fill(lastName)

  await page.getByRole('button', { name: 'Ajouter', exact: true }).click()
  await page.waitForURL('**/dashboard/members')
  expect(await countWhere(page, 'members', 'lastName', lastName)).toBe(1)
})

test('créer un culte', async ({ page }) => {
  const title = label('Culte')
  await page.goto('/dashboard/planning/new', { waitUntil: 'networkidle' })
  await page.locator('#title').fill(title)
  await page.locator('#date').fill(futureDate(31))

  await page.getByRole('button', { name: 'Créer le culte' }).click()
  await page.waitForURL('**/dashboard/planning')
  expect(await countWhere(page, 'service-plans', 'title', title)).toBe(1)
})

test('supprimer une salle depuis la liste', async ({ page }) => {
  const name = label('Salle à supprimer')
  await page.goto('/dashboard/rooms')
  const me = await api(page, 'GET', '/api/users/me')
  const church = me.json.user.tenants[0].tenant
  const created = await api(page, 'POST', '/api/rooms', {
    name,
    church: typeof church === 'object' ? church.id : church,
  })
  expect(created.status).toBe(201)

  await page.reload({ waitUntil: 'networkidle' })
  await page
    .locator('div.p-4')
    .filter({ hasText: name })
    .getByRole('button', { name: 'Actions' })
    .click()
  await page.getByRole('menuitem', { name: 'Supprimer' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Supprimer' }).click()

  await expect(page.getByText('Salle supprimée')).toBeVisible()
  expect(await countWhere(page, 'rooms', 'name', name)).toBe(0)
})

test('modifier son propre compte garde le rôle', async ({ page }) => {
  await page.goto('/dashboard')
  const me = await api(page, 'GET', '/api/users/me')
  const { id, email } = me.json.user

  // Aucun changement réel : le même email. Avant le correctif du hook de rôle,
  // cette requête échouait sur « rôle requis ».
  const res = await api(page, 'PATCH', `/api/users/${id}`, { email })
  expect(res.status).toBe(200)
  expect(res.json.doc.role).toBe('admin-church')

  await page.reload()
  await expect(page, 'la session doit rester valide').toHaveURL(/\/dashboard$/)
})
