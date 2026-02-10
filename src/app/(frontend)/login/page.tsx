import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getTenantSlug, getTenantBySlug } from '@/lib/tenant'
import { LoginForm } from '@/components/login-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { redirect: redirectTo } = await searchParams

  // Vérifier si déjà connecté
  const { user } = await payload.auth({ headers })
  if (user) {
    redirect(redirectTo || '/dashboard')
  }

  // Résolution du tenant
  const tenantSlug = getTenantSlug(headers)
  const tenant = tenantSlug ? await getTenantBySlug(payload, tenantSlug) : null

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {tenant ? tenant.name : 'Narthex'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connectez-vous à votre espace
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={redirectTo} />
        </CardContent>
      </Card>
    </div>
  )
}
