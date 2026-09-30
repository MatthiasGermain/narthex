import fs from 'fs'
import { expect, test as setup, type Page } from '@playwright/test'
import { api, authFile, env, submitLogin } from './helpers'

/**
 * Connexion par le formulaire, pour chaque rôle. La session est enregistrée
 * et réutilisée par les autres tests.
 *
 * Le rechargement est le cœur du test : une connexion peut répondre 200 avec
 * un token sans que la session soit en base, et c'est au chargement suivant
 * qu'on est renvoyé sur /login.
 */
async function loginAndKeepSession(
  page: Page,
  email: string,
  password: string,
  expectedRole: string,
  file: string,
) {
  await submitLogin(page, email, password)
  await page.waitForURL('**/dashboard')

  await page.reload({ waitUntil: 'networkidle' })
  await expect(page, 'la session doit survivre au rechargement').toHaveURL(/\/dashboard$/)

  const me = await api(page, 'GET', '/api/users/me')
  expect(me.json?.user?.role, `le compte ${email} doit avoir le rôle ${expectedRole}`).toBe(
    expectedRole,
  )

  fs.mkdirSync(env('TEST_AUTH_DIR'), { recursive: true })
  await page.context().storageState({ path: file })
}

setup('mauvais mot de passe : message affiché, pas de connexion', async ({ page }) => {
  await submitLogin(page, env('TEST_VOLUNTEER_EMAIL'), 'mot-de-passe-volontairement-faux')

  // Premier appel à l'API : le serveur de dev compile la route, d'où le délai large.
  await expect(page.getByText('Email ou mot de passe incorrect.')).toBeVisible({
    timeout: 90_000,
  })
  await expect(page).toHaveURL(/\/login/)
})

setup("admin d'église : connexion et session conservée", async ({ page }) => {
  await loginAndKeepSession(
    page,
    env('TEST_ADMIN_EMAIL'),
    env('TEST_ADMIN_PASSWORD'),
    'admin-church',
    authFile('admin'),
  )
})

setup('bénévole : connexion et session conservée', async ({ page }) => {
  await loginAndKeepSession(
    page,
    env('TEST_VOLUNTEER_EMAIL'),
    env('TEST_VOLUNTEER_PASSWORD'),
    'volunteer',
    authFile('benevole'),
  )
})
