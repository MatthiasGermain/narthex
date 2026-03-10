import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

import { resolveTenant } from '@/lib/tenant'
import { checkUserTenantAccess } from '@/lib/tenant-check'
import { TenantTheme } from '@/components/tenant-theme'
import { LoginForm } from '@/components/login-form'

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
  const { user, tenant, branding, logoUrl } = await resolveTenant()
  const { redirect: redirectTo } = await searchParams

  if (!tenant) notFound()

  if (user) {
    if (checkUserTenantAccess(user, tenant.id)) {
      redirect(redirectTo?.startsWith('/') ? redirectTo : '/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen bg-violet/10">
      <TenantTheme colors={branding?.colors || {}} />
      <div className="m-auto w-full max-w-md px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-raisin/50 hover:text-raisin transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au site
        </Link>

        <div className="rounded-xl bg-cream border border-raisin/8 shadow-[0_4px_24px_rgba(30,41,82,0.06)] overflow-hidden">
          <div className="h-1 bg-sunglow" />
          <div className="p-8">
          {/* Logo + Nom */}
          <div className="flex flex-col items-center gap-3 mb-8">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={tenant.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded object-contain"
              />
            ) : (
              <Image
                src="/brand/pictogramme_noir_sans_fond.svg"
                alt="Narthex"
                width={48}
                height={48}
                className="h-12 w-12"
              />
            )}
            <h1 className="font-heading font-black text-xl uppercase tracking-wide text-raisin">
              {tenant.name}
            </h1>
            <p className="text-sm text-raisin/50">
              Connectez-vous à votre espace
            </p>
          </div>

          {user && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-700">
              Vous êtes connecté(e) avec un compte qui n&apos;appartient pas à cette église.
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/api/users/logout" className="underline ml-1 font-medium">
                Se déconnecter
              </a>
            </div>
          )}

          <LoginForm redirectTo={redirectTo} tenantId={tenant.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
