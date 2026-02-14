import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { resolveTenant } from '@/lib/tenant'
import { checkUserTenantAccess } from '@/lib/tenant-check'
import { TenantTheme } from '@/components/tenant-theme'
import { LoginForm } from '@/components/login-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export async function generateMetadata(): Promise<Metadata> {
  const { tenant } = await resolveTenant()
  if (!tenant) return {}
  return {
    title: `Connexion | ${tenant.name}`,
    description: `Connectez-vous à l'espace membre de ${tenant.name}.`,
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { user, tenant, branding } = await resolveTenant()
  const { redirect: redirectTo } = await searchParams

  if (!tenant) notFound()

  // Vérifier si déjà connecté
  if (user) {
    if (checkUserTenantAccess(user, tenant.id)) {
      redirect(redirectTo || '/dashboard')
    }
    // User connecté mais mauvais tenant → afficher erreur ci-dessous
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
      <TenantTheme colors={branding?.colors || {}} />
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
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
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
