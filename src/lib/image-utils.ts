type ImageLike = {
  id: number
  url?: string | null
  sizes?: { thumbnail?: { url?: string | null } }
}

/**
 * Extrait l'URL thumbnail (ou fallback url) d'un objet media Payload.
 * Utilisable dans les pages liste (events, members, rooms).
 */
export function getThumbUrl(image: unknown): string | null {
  if (!image || typeof image !== 'object') return null
  const img = image as ImageLike
  return img.sizes?.thumbnail?.url || img.url || null
}

/**
 * Extrait id + preview URL depuis un champ media Payload (image ou photo).
 * Utilisable dans les formulaires (event-form, room-form, member-form).
 */
export function getInitialMedia(
  media: number | ImageLike | null | undefined,
): { id: number | null; preview: string | null } {
  if (!media) return { id: null, preview: null }
  if (typeof media === 'number') return { id: media, preview: null }
  return {
    id: media.id,
    preview: media.sizes?.thumbnail?.url || media.url || null,
  }
}
