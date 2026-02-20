const store = new Map<string, { count: number; resetTime: number }>()

// Nettoyage des entrées expirées toutes les 60 secondes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store) {
    if (now > value.resetTime) {
      store.delete(key)
    }
  }
}, 60_000)

/**
 * Rate limiting en mémoire par clé (IP).
 * Retourne true si la requête est autorisée, false si bloquée.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count < limit) {
    entry.count++
    return true
  }

  return false
}
