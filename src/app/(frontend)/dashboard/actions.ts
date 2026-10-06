'use server'

import { resolveTenant } from '@/lib/tenant'
import { checkUserTenantAccess } from '@/lib/tenant-check'
import { checkRateLimit } from '@/lib/rate-limit'
import { generateSuggestionEmail } from '@/lib/emails/suggestion'
import {
  SUGGESTION_KIND_LABELS,
  SUGGESTION_MAX_LENGTH,
  SUGGESTION_MIN_LENGTH,
  type SuggestionKind,
} from '@/lib/suggestions'

const SUGGESTION_RECIPIENT = 'contact@narthex.dev'

/**
 * Enregistre une suggestion d'un admin d'église puis prévient l'équipe Narthex
 * par email (auteur en reply-to). L'enregistrement fait foi : un échec d'envoi
 * est seulement journalisé, la suggestion reste visible dans l'admin Payload.
 */
export async function sendSuggestion(data: { kind: string; page: string; message: string }) {
  const { payload, user, tenant } = await resolveTenant()

  if (!user || !tenant) return { success: false, error: 'Non authentifié' }
  if (user.role === 'volunteer' || !checkUserTenantAccess(user, tenant.id)) {
    return { success: false, error: 'Accès refusé' }
  }

  const kindLabel = SUGGESTION_KIND_LABELS[data.kind]
  const message = typeof data.message === 'string' ? data.message.trim() : ''
  const page = typeof data.page === 'string' ? data.page.slice(0, 200) : ''

  if (!kindLabel) return { success: false, error: 'Type de suggestion invalide' }
  if (message.length < SUGGESTION_MIN_LENGTH || message.length > SUGGESTION_MAX_LENGTH) {
    return {
      success: false,
      error: `Le message doit contenir entre ${SUGGESTION_MIN_LENGTH} et ${SUGGESTION_MAX_LENGTH} caractères`,
    }
  }

  if (!checkRateLimit(`suggestion:${user.id}`, 5, 60 * 60 * 1000)) {
    return { success: false, error: 'Trop de suggestions envoyées. Réessayez dans une heure.' }
  }

  const { docs: memberDocs } = await payload.find({
    collection: 'members',
    where: { user: { equals: user.id }, church: { equals: tenant.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const member = memberDocs[0]
  const authorName = member ? `${member.firstName} ${member.lastName}`.trim() || null : null

  let suggestionId: number
  try {
    const suggestion = await payload.create({
      collection: 'suggestions',
      data: {
        status: 'nouvelle',
        kind: data.kind as SuggestionKind,
        message,
        page: page || undefined,
        church: tenant.id,
        author: user.id,
      },
      overrideAccess: true,
    })
    suggestionId = suggestion.id
  } catch (err) {
    console.error(err)
    return { success: false, error: "L'envoi a échoué. Réessayez plus tard." }
  }

  try {
    await payload.sendEmail({
      to: SUGGESTION_RECIPIENT,
      replyTo: user.email,
      subject: `[Narthex] Suggestion de ${tenant.name} — ${kindLabel}`,
      html: generateSuggestionEmail({
        churchName: tenant.name,
        churchSlug: tenant.slug,
        authorName,
        authorEmail: user.email,
        kindLabel,
        page: page || '—',
        message,
        adminUrl: `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/admin/collections/suggestions/${suggestionId}`,
      }),
    })
  } catch (err) {
    console.error(err)
  }

  return { success: true }
}
