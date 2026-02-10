import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'

import config from '@/payload.config'
import { getTenantSlug, getTenantBySlug } from '@/lib/tenant'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Résolution du tenant depuis le middleware
  const tenantSlug = getTenantSlug(headers)
  const tenant = tenantSlug ? await getTenantBySlug(payload, tenantSlug) : null

  // 404 si un slug est fourni mais ne correspond à aucune église
  if (tenantSlug && !tenant) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      {tenant ? (
        <>
          <h1 className="text-4xl font-bold">{tenant.name}</h1>
          <p className="text-muted-foreground">
            Tenant : <code className="rounded bg-muted px-2 py-1 text-sm">{tenantSlug}</code>
          </p>
        </>
      ) : (
        <>
          {!user && <h1 className="text-4xl font-bold">Narthex</h1>}
          {user && <h1 className="text-4xl font-bold">Bienvenue, {user.email}</h1>}
          <p className="text-muted-foreground">
            Aucun tenant d\u00e9tect\u00e9. Essayez <code className="rounded bg-muted px-2 py-1 text-sm">?tenant=votre-slug</code>
          </p>
        </>
      )}
      <Button asChild>
        <a href="/admin" target="_blank" rel="noopener noreferrer">
          Admin Payload
        </a>
      </Button>
    </div>
  )
}
