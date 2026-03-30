import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { generateInvitationEmail } from '@/lib/emails/invitation'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const invitationId = Number(id)
  if (Number.isNaN(invitationId)) {
    return NextResponse.json({ error: 'ID invalide.' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const headersList = await getHeaders()

  // Authentifier le user via le cookie
  const { user } = await payload.auth({ headers: headersList })
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const role = (user as { role?: string }).role
  if (role !== 'super-admin' && role !== 'admin-church') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  }

  // Récupérer l'invitation
  const invitation = await payload.findByID({
    collection: 'invitations',
    id: invitationId,
    depth: 0,
    overrideAccess: true,
  }).catch(() => null)

  if (!invitation || invitation.status !== 'pending') {
    return NextResponse.json(
      { error: 'Invitation introuvable ou déjà traitée.' },
      { status: 404 },
    )
  }

  // Vérifier que l'invitation appartient à la même église
  const userTenants = (user as { tenants?: Array<{ tenant: number | string | { id: number | string } }> }).tenants || []
  const userTenantIds = userTenants.map((t) =>
    String(typeof t.tenant === 'object' ? t.tenant.id : t.tenant),
  )
  const invChurchId = String(
    typeof invitation.church === 'object' ? (invitation.church as { id: number }).id : invitation.church,
  )

  if (role !== 'super-admin' && !userTenantIds.includes(invChurchId)) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  }

  // Regénérer token et expiration
  const newToken = crypto.randomUUID()
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  await payload.update({
    collection: 'invitations',
    id: invitationId,
    data: {
      token: newToken,
      expiresAt: newExpiresAt,
    },
    overrideAccess: true,
  })

  // Résoudre le domaine pour l'email
  const churchId = typeof invitation.church === 'object'
    ? (invitation.church as { id: number }).id
    : invitation.church

  const church = await payload.findByID({
    collection: 'churches',
    id: churchId,
    depth: 0,
    overrideAccess: true,
  }).catch(() => null)

  const churchName = (church?.name as string) || 'votre église'
  const customDomain = church?.domain as string | undefined
  const churchSlug = church?.slug as string | undefined

  let baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
  if (customDomain) {
    baseUrl = `https://${customDomain}`
  } else if (churchSlug && process.env.NODE_ENV === 'production') {
    baseUrl = `https://${churchSlug}.narthex.dev`
  }

  const html = generateInvitationEmail({ churchName, token: newToken, baseUrl })

  await payload.sendEmail({
    to: invitation.email as string,
    subject: `Rejoignez ${churchName} sur Narthex`,
    html,
  })

  return NextResponse.json({ success: true })
}
