import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'

/**
 * Tests des flux par rôle (anonyme, bénévole, admin d'église).
 *
 * Config séparée de celle du template : pas de `webServer` (le serveur de dev
 * est lancé à la main), pas de rapport HTML bloquant, et surtout les tests du
 * template ne sont pas embarqués — ils créent un super-admin dans la base.
 *
 * Lancement : node node_modules/@playwright/test/cli.js test --config tests/roles/playwright.config.ts
 */
const dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(dirname, '../..')

dotenv.config({ path: path.join(root, '.env.test.local') })

const authDir = path.join(root, 'test-results', 'roles-auth')
process.env.TEST_AUTH_DIR = authDir

export default defineConfig({
  testDir: dirname,
  outputDir: path.join(root, 'test-results', 'roles'),
  // Une seule fenêtre à la fois : les tests écrivent dans la même église.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  // Le serveur de dev compile chaque page à la première visite.
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.TEST_BASE_URL,
    channel: process.env.TEST_BROWSER_CHANNEL || 'msedge',
    headless: false,
    launchOptions: { slowMo: 100 },
    navigationTimeout: 90_000,
    locale: 'fr-FR',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'connexion', testMatch: /connexion\.setup\.ts/, teardown: 'nettoyage' },
    { name: 'nettoyage', testMatch: /nettoyage\.teardown\.ts/ },
    { name: 'anonyme', testMatch: /anonyme\.spec\.ts/, dependencies: ['connexion'] },
    {
      name: 'admin',
      testMatch: /admin\.spec\.ts/,
      dependencies: ['connexion'],
      use: { storageState: path.join(authDir, 'admin.json') },
    },
    {
      name: 'benevole',
      testMatch: /benevole\.spec\.ts/,
      dependencies: ['connexion'],
      use: { storageState: path.join(authDir, 'benevole.json') },
    },
  ],
})
