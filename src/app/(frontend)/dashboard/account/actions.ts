'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'

export async function updateMyProfile(memberId: number, data: {
  firstName: string
  lastName: string
  phone?: string
  birthDate?: string
  photo?: number | null
}) {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Vérifier que ce member appartient bien à cet utilisateur
  const member = await payload.findByID({
    collection: 'members',
    id: memberId,
    overrideAccess: true,
  })

  const memberUserId = typeof member.user === 'object' ? member.user?.id : member.user
  if (memberUserId !== user.id) {
    return { success: false, error: 'Accès refusé' }
  }

  try {
    await payload.update({
      collection: 'members',
      id: memberId,
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim() || undefined,
        birthDate: data.birthDate || undefined,
        photo: data.photo ?? null,
      },
      overrideAccess: true,
    })
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

/**
 * Envoie un lien de réinitialisation au compte connecté.
 *
 * L'email vient de la session, jamais du client : l'action était appelable avec
 * n'importe quelle adresse. Et elle passait par un `fetch` HTTP depuis le
 * serveur, donc sans `x-forwarded-for` — les 3 tentatives / 15 min du middleware
 * étaient comptées sur une clé unique partagée par tous les utilisateurs, si
 * bien que n'importe qui pouvait bloquer la réinitialisation de tout le monde.
 */
export async function requestPasswordReset() {
  const payload = await getPayload({ config })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  if (!user?.email) return { success: false, error: 'Non authentifié' }

  try {
    await payload.forgotPassword({
      collection: 'users',
      data: { email: user.email },
    })
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "L'email n'a pas pu être envoyé" }
  }
}
