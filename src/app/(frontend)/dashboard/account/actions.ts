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
  } catch {
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || ''}/api/users/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    return { success: res.ok }
  } catch {
    return { success: false }
  }
}
