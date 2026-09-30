'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { resolveTenant } from '@/lib/tenant'
import { checkUserTenantAccess } from '@/lib/tenant-check'

interface ImportRow {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  churchRole: string
}

interface ImportResult {
  row: number
  firstName: string
  lastName: string
  status: 'created' | 'skipped' | 'error'
  message: string
}

export async function importMembers(rows: ImportRow[]): Promise<ImportResult[]> {
  const { user, tenant } = await resolveTenant()
  if (!user || !tenant) throw new Error('Non authentifié')
  if (user.role !== 'super-admin' && user.role !== 'admin-church') throw new Error('Accès refusé')
  // L'église vient du header Host : sans ce contrôle, un admin de A importe
  // des membres chez B en postant l'action sur le domaine de B.
  if (!checkUserTenantAccess(user, tenant.id)) throw new Error('Accès refusé')

  const payload = await getPayload({ config })

  // Pré-fetch emails existants pour détecter les doublons
  const { docs: existing } = await payload.find({
    collection: 'members',
    where: { church: { equals: tenant.id } },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  const existingEmails = new Set(
    existing.map((m) => m.email?.toLowerCase()).filter(Boolean),
  )

  const results: ImportResult[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]

    if (row.email && existingEmails.has(row.email.toLowerCase())) {
      results.push({
        row: i,
        firstName: row.firstName,
        lastName: row.lastName,
        status: 'skipped',
        message: 'Email déjà existant',
      })
      continue
    }

    try {
      await payload.create({
        collection: 'members',
        data: {
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email || undefined,
          phone: row.phone || undefined,
          churchRole: (row.churchRole || 'membre') as 'pasteur' | 'diacre' | 'ancien' | 'responsable' | 'membre' | 'visiteur',
          church: tenant.id,
        },
        user,
        overrideAccess: false,
      })
      results.push({
        row: i,
        firstName: row.firstName,
        lastName: row.lastName,
        status: 'created',
        message: 'Créé',
      })
      if (row.email) existingEmails.add(row.email.toLowerCase())
    } catch (err) {
      results.push({
        row: i,
        firstName: row.firstName,
        lastName: row.lastName,
        status: 'error',
        message: err instanceof Error ? err.message : 'Erreur',
      })
    }
  }

  return results
}
