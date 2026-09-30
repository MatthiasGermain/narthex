import fs from 'fs'
import { expect, test as teardown } from '@playwright/test'
import { api, authFile, env, TAG } from './helpers'

/**
 * Supprime tout ce que les tests ont créé, y compris les restes d'un lancement
 * interrompu. Seules les fiches dont le champ contient la marque sont touchées.
 */
const TARGETS: [collection: string, field: string][] = [
  ['events', 'title'],
  ['service-plans', 'title'],
  ['members', 'lastName'],
  ['rooms', 'name'],
  ['media', 'alt'],
]

teardown('supprimer les fiches de test', async ({ browser }) => {
  const adminState = authFile('admin')
  teardown.skip(!fs.existsSync(adminState), "pas de session admin : rien n'a pu être créé")

  const context = await browser.newContext({ storageState: adminState })
  const page = await context.newPage()
  await page.goto('/dashboard')

  const marker = TAG.slice(1, -1)
  for (const [collection, field] of TARGETS) {
    const url = `/api/${collection}?where[${field}][contains]=${encodeURIComponent(marker)}&depth=0&limit=200`
    const found = await api(page, 'GET', url)
    expect(found.status, `lecture de ${collection}`).toBe(200)

    for (const doc of found.json.docs as Record<string, unknown>[]) {
      if (!String(doc[field] ?? '').includes(TAG)) continue
      const res = await api(page, 'DELETE', `/api/${collection}/${doc.id}`)
      expect.soft(res.status, `suppression ${collection}/${doc.id}`).toBe(200)
    }

    const left = await api(page, 'GET', url)
    expect.soft(left.json.totalDocs, `fiches de test restantes dans ${collection}`).toBe(0)
  }

  await context.close()
  fs.rmSync(env('TEST_AUTH_DIR'), { recursive: true, force: true })
})
