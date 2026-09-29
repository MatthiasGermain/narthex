'use server'

import { resolveTenant } from '@/lib/tenant'
import { getUserTenantIDs } from '@/access'
import { SIGNUP_LINK_EXPIRATION } from '@/lib/password-link'

export type CreateAccountResult = { ok: true } | { ok: false; error: string }

/**
 * Crée le compte Narthex d'une fiche membre existante et lui envoie le lien
 * de définition de mot de passe. Tout est décidé côté serveur : l'église vient
 * du tenant courant, jamais du client, et la fiche à rattacher est passée au
 * hook `autoCreateMember` pour qu'il lie au lieu de créer un doublon.
 */
export async function createAccountForMember(memberId: number): Promise<CreateAccountResult> {
  const { payload, user, tenant } = await resolveTenant()
  if (!user || !tenant) return { ok: false, error: 'Non authentifié.' }

  const role = (user as { role?: string }).role
  if (role !== 'super-admin' && role !== 'admin-church') {
    return { ok: false, error: 'Accès refusé.' }
  }

  // resolveTenant ne vérifie pas l'appartenance : on le fait ici.
  const belongsToTenant = getUserTenantIDs(user)
    .map(String)
    .includes(String(tenant.id))
  if (role !== 'super-admin' && !belongsToTenant) {
    return { ok: false, error: 'Accès refusé.' }
  }

  const member = await payload
    .findByID({ collection: 'members', id: memberId, depth: 0, overrideAccess: true })
    .catch(() => null)

  if (!member) return { ok: false, error: 'Membre introuvable.' }

  const memberChurchId =
    typeof member.church === 'object' ? (member.church as { id: number }).id : member.church
  if (String(memberChurchId) !== String(tenant.id)) {
    return { ok: false, error: 'Accès refusé.' }
  }

  if (member.user) {
    return { ok: false, error: 'Ce membre a déjà un compte utilisateur.' }
  }

  const email = (member.email || '').toLowerCase().trim()
  if (!email) {
    return { ok: false, error: "Renseignez l'email du membre avant de créer son compte." }
  }

  const existingUsers = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existingUsers.docs.length > 0) {
    return { ok: false, error: `Un compte Narthex existe déjà avec l'email ${email}.` }
  }

  // Une invitation en attente deviendrait caduque une fois le compte créé :
  // on la solde pour ne pas laisser un lien mort dans la liste des invitations.
  const pendingInvitations = await payload.find({
    collection: 'invitations',
    where: {
      email: { equals: email },
      church: { equals: tenant.id },
      status: { equals: 'pending' },
    },
    limit: 20,
    depth: 0,
    overrideAccess: true,
  })

  try {
    await payload.create({
      collection: 'users',
      data: {
        email,
        password: crypto.randomUUID(),
        role: 'volunteer',
        tenants: [{ tenant: tenant.id }],
      },
      overrideAccess: true,
      context: { linkMemberId: memberId },
    })
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Création du compte impossible.',
    }
  }

  for (const invitation of pendingInvitations.docs) {
    await payload
      .update({
        collection: 'invitations',
        id: invitation.id,
        data: { status: 'accepted' },
        overrideAccess: true,
      })
      .catch(() => null)
  }

  try {
    await payload.forgotPassword({
      collection: 'users',
      data: { email },
      expiration: SIGNUP_LINK_EXPIRATION,
      context: { isSignupLink: true },
    })
  } catch {
    return {
      ok: false,
      error:
        "Compte créé, mais l'email n'a pas pu être envoyé. Le membre peut utiliser « mot de passe oublié » depuis la page de connexion.",
    }
  }

  return { ok: true }
}
