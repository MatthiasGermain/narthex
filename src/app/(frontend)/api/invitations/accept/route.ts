import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string; firstName?: string; lastName?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const { token, password, firstName, lastName } = body

  if (!token || !password || !firstName?.trim() || !lastName?.trim()) {
    return NextResponse.json(
      { error: 'Tous les champs sont requis.' },
      { status: 400 },
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Le mot de passe doit contenir au moins 8 caractères.' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config })

  // 1. Valider le token
  const invitations = await payload.find({
    collection: 'invitations',
    where: {
      token: { equals: token },
      status: { equals: 'pending' },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const invitation = invitations.docs[0]
  if (!invitation) {
    return NextResponse.json(
      { error: 'Invitation invalide ou déjà utilisée.' },
      { status: 400 },
    )
  }

  // Vérifier l'expiration
  if (new Date(invitation.expiresAt) < new Date()) {
    await payload.update({
      collection: 'invitations',
      id: invitation.id,
      data: { status: 'expired' },
      overrideAccess: true,
    })
    return NextResponse.json(
      { error: 'Cette invitation a expiré. Contactez l\'administrateur de votre église.' },
      { status: 400 },
    )
  }

  // 2. Vérifier qu'aucun user n'existe déjà
  const existingUsers = await payload.find({
    collection: 'users',
    where: { email: { equals: invitation.email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existingUsers.docs.length > 0) {
    return NextResponse.json(
      { error: 'Un compte existe déjà avec cet email.' },
      { status: 400 },
    )
  }

  const churchId = typeof invitation.church === 'object'
    ? (invitation.church as { id: number }).id
    : invitation.church

  // 3. Créer le User (le hook autoCreateMember créera le Member)
  const newUser = await payload.create({
    collection: 'users',
    data: {
      email: invitation.email,
      password,
      role: invitation.role,
      tenants: [{ tenant: churchId }],
    },
    overrideAccess: true,
  })

  // 4. Le hook a rattaché la fiche membre (existante ou nouvelle) : on y pose les vrais noms
  const members = await payload.find({
    collection: 'members',
    where: { user: { equals: newUser.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (members.docs.length > 0) {
    await payload.update({
      collection: 'members',
      id: members.docs[0].id,
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      overrideAccess: true,
    })
  }

  // 5. Marquer l'invitation comme acceptée
  await payload.update({
    collection: 'invitations',
    id: invitation.id,
    data: { status: 'accepted' },
    overrideAccess: true,
  })

  return NextResponse.json({ success: true, redirectTo: '/dashboard' })
}
