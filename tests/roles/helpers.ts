import path from 'path'
import { expect, type Page } from '@playwright/test'

/** Marque toutes les fiches créées par les tests : le nettoyage ne supprime qu'elles. */
export const TAG = '[TEST-E2E]'

const runId = Date.now().toString(36)

/** Nom unique d'une fiche de test, ex. « [TEST-E2E] Salle m1x2y3 ». */
export const label = (what: string) => `${TAG} ${what} ${runId}`

export function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} est vide : complétez .env.test.local`)
  return value
}

export const authFile = (role: 'admin' | 'benevole') =>
  path.join(env('TEST_AUTH_DIR'), `${role}.json`)

/** Date à venir au format des champs `type="date"`. */
export function futureDate(days: number): string {
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 10)
}

/** PNG 1×1, suffisant pour exercer l'upload et le redimensionnement. */
export const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

export interface ApiResult {
  status: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any
}

/**
 * Appel d'API fait depuis la page, comme le font les formulaires : mêmes
 * cookies, même origine. La page doit déjà être sur le site.
 */
export async function api(
  page: Page,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  body?: unknown,
): Promise<ApiResult> {
  return page.evaluate(
    async ({ method, url, body }) => {
      const res = await fetch(url, {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      const json = await res.json().catch(() => null)
      return { status: res.status, json }
    },
    { method, url, body },
  )
}

/** Remplit et envoie le formulaire de connexion, sans attendre le résultat. */
export async function submitLogin(page: Page, email: string, password: string) {
  // networkidle : le formulaire doit être hydraté, sinon le clic recharge la page.
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.locator('#login-email').fill(email)
  await page.locator('#login-password').fill(password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
}

/** Ouvre une page et vérifie qu'elle s'affiche : statut 200, pas de redirection, pas d'erreur JS. */
export async function expectPageOk(page: Page, url: string) {
  const errors: string[] = []
  const onError = (err: Error) => errors.push(err.message)
  page.on('pageerror', onError)

  const res = await page.goto(url, { waitUntil: 'networkidle' })

  page.off('pageerror', onError)
  expect.soft(res?.status(), `${url} : statut HTTP`).toBe(200)
  expect.soft(new URL(page.url()).pathname, `${url} : redirection inattendue`).toBe(url)
  expect.soft(errors, `${url} : erreurs JavaScript`).toEqual([])
}

/** Nombre de fiches d'une collection dont `field` vaut exactement `value`. */
export async function countWhere(page: Page, collection: string, field: string, value: string) {
  const res = await api(
    page,
    'GET',
    `/api/${collection}?where[${field}][equals]=${encodeURIComponent(value)}&depth=0&limit=1`,
  )
  expect(res.status, `lecture de ${collection}`).toBe(200)
  return res.json.totalDocs as number
}
