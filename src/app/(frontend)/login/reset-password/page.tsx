import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { ResetPasswordForm } from '@/components/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen bg-violet/10">
      <div className="m-auto w-full max-w-md px-4 py-12">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-raisin/50 hover:text-raisin transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>

        <div className="rounded-xl bg-cream border border-raisin/8 shadow-[0_4px_24px_rgba(30,41,82,0.06)] overflow-hidden">
          <div className="h-1 bg-sunglow" />
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="font-heading font-black text-xl uppercase tracking-wide text-raisin">
                Nouveau mot de passe
              </h1>
              <p className="text-sm text-raisin/50 mt-2">
                Choisissez un nouveau mot de passe
              </p>
            </div>
            <Suspense>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
