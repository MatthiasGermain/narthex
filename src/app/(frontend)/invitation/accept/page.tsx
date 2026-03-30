import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'

import { AcceptInvitationForm } from '@/components/accept-invitation-form'

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return <InvalidInvitation message="Lien d'invitation invalide." />
  }

  const payload = await getPayload({ config })

  const invitations = await payload.find({
    collection: 'invitations',
    where: {
      token: { equals: token },
      status: { equals: 'pending' },
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  const invitation = invitations.docs[0]

  if (!invitation) {
    return <InvalidInvitation message="Cette invitation est invalide ou a déjà été utilisée." />
  }

  if (new Date(invitation.expiresAt) < new Date()) {
    return <InvalidInvitation message="Cette invitation a expiré. Contactez l'administrateur de votre église." />
  }

  const church = invitation.church as { name?: string } | null
  const churchName = church?.name || 'votre église'

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
                Rejoignez {churchName}
              </h1>
              <p className="text-sm text-raisin/50 mt-2">
                Créez votre compte pour accéder à l&apos;espace membre
              </p>
            </div>
            <AcceptInvitationForm
              token={token}
              email={invitation.email}
              defaultFirstName={invitation.firstName || ''}
              defaultLastName={invitation.lastName || ''}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function InvalidInvitation({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen bg-violet/10">
      <div className="m-auto w-full max-w-md px-4 py-12">
        <div className="rounded-xl bg-cream border border-raisin/8 shadow-[0_4px_24px_rgba(30,41,82,0.06)] overflow-hidden">
          <div className="h-1 bg-destructive" />
          <div className="p-8 text-center">
            <h1 className="font-heading font-black text-xl uppercase tracking-wide text-raisin mb-4">
              Invitation invalide
            </h1>
            <p className="text-sm text-raisin/60 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-raisin hover:text-raisin/70 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Aller à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
