/**
 * Vérifie si un user a accès à un tenant donné.
 * Fonctionne côté server ET client (fonction pure, pas d'import server).
 */
export function checkUserTenantAccess(
  user: { role?: string; tenants?: Array<{ tenant: number | string | { id: number | string } }> | null },
  tenantId: number | string,
): boolean {
  if (user.role === 'super-admin') return true
  if (!user.tenants || !Array.isArray(user.tenants)) return false
  return user.tenants.some((t) => {
    const id = typeof t.tenant === 'object' ? t.tenant?.id : t.tenant
    return String(id) === String(tenantId)
  })
}
