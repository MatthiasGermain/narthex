import { headers as getHeaders } from 'next/headers.js'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { getTenantSlug, getTenantBySlug } from '@/lib/tenant'
import { checkUserTenantAccess } from '@/lib/tenant-check'
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

  // Résolution du tenant — obligatoire
  const tenantSlug = getTenantSlug(headers)
  if (!tenantSlug) {
    notFound()
  }

  const tenant = await getTenantBySlug(payload, tenantSlug)
  if (!tenant) {
    notFound()
  }

  // Vérifier si déjà connecté
  const { user } = await payload.auth({ headers })
  if (user) {
    if (checkUserTenantAccess(user, tenant.id)) {
      redirect(redirectTo || '/dashboard')
    }
    // User connecté mais mauvais tenant → afficher erreur ci-dessous
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {tenant.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connectez-vous à votre espace
          </p>
        </CardHeader>
        <CardContent>
          {user && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              Vous êtes connecté(e) avec un compte qui n&apos;appartient pas à cette église.
              <a href="/api/users/logout" className="underline ml-1 font-medium">
                Se déconnecter
              </a>
            </div>
          )}
          <LoginForm redirectTo={redirectTo} tenantId={tenant.id} />
        </CardContent>
      </Card>
    </div>
  )
}
