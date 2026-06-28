import { revalidateTag } from 'next/cache'

/**
 * Tags de cache pour les données tenant (église, branding, profil).
 * Ces données changent rarement et sont relues à chaque page du dashboard,
 * donc on les met en cache cross-requêtes (unstable_cache) et on les
 * invalide via ces tags lors d'une modification.
 */
export const cacheTags = {
  churchSlug: (slug: string) => `church-slug:${slug}`,
  churchDomain: (domain: string) => `church-domain:${domain}`,
  branding: (churchId: number | string) => `branding:${churchId}`,
  profile: (churchId: number | string) => `profile:${churchId}`,
}

/**
 * revalidateTag sécurisé : ne casse pas les mutations exécutées hors d'un
 * contexte de requête Next (ex: scripts de seed via tsx), où revalidateTag throw.
 */
export function safeRevalidateTag(tag: string) {
  try {
    revalidateTag(tag)
  } catch {
    // Hors contexte requête Next — invalidation ignorée (le TTL prendra le relais).
  }
}
