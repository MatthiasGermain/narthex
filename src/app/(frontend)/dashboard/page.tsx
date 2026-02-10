import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

import config from '@/payload.config'

export default async function DashboardPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Tableau de bord</h1>
      <p className="text-muted-foreground">
        Bienvenue, {user?.email}
      </p>
      <p className="text-sm text-muted-foreground">
        Les actions rapides (gestion des événements) arriveront dans l'Epic 3.
      </p>
    </div>
  )
}
