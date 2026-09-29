import type {
  Access,
  CollectionAfterChangeHook,
  CollectionAfterLoginHook,
  CollectionConfig,
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  FieldAccess,
} from 'payload'
import { isSuperAdmin, isSuperAdminCheck, belongsToChurch, getUserTenantIDs } from '../access'
import { RESET_LINK_EXPIRATION, SIGNUP_LINK_EXPIRATION } from '../lib/password-link'

const updateScopedToTenant = ({ req: { user } }: { req: { user: unknown } }) => {
  if (!user) return false
  const u = user as { role?: string }
  if (u.role === 'super-admin') return true
  // admin-church can only update users in their own tenant
  const tenantIDs = getUserTenantIDs(user)
  if (tenantIDs.length === 0) return false
  return { 'tenants.tenant': { in: tenantIDs } }
}

const canEditRole: FieldAccess = ({ req: { user } }) => {
  const role = (user as { role?: string })?.role
  return role === 'super-admin' || role === 'admin-church'
}

// Allow admin-church to create user accounts (hook enforces volunteer-only)
const canCreateUser: Access = ({ req: { user } }) => {
  if (!user) return false
  const u = user as { role?: string }
  if (u.role === 'super-admin') return true
  if (u.role === 'admin-church') return true
  return false
}

// Enforce allowed roles: admin-church can set volunteer or admin-church, never super-admin
const enforceAllowedRole: CollectionBeforeChangeHook = async ({ req, operation, data, originalDoc }) => {
  const currentUser = req.user as { id?: number; role?: string } | undefined
  if (!currentUser) return data

  // Super-admins can do anything
  if (currentUser.role === 'super-admin') return data

  if (currentUser.role === 'admin-church') {
    if (operation === 'create') {
      // admin-church can create volunteer or admin-church, never super-admin
      if (data.role === 'super-admin') {
        data.role = 'volunteer'
      }
    }

    if (operation === 'update' && data.role !== undefined) {
      // Cannot change own role
      if (originalDoc?.id === currentUser.id) {
        delete data.role
        return data
      }

      // Cannot modify a super-admin's role
      if (originalDoc?.role === 'super-admin') {
        delete data.role
        return data
      }

      // Can only set volunteer or admin-church
      if (data.role === 'super-admin') {
        data.role = originalDoc?.role || 'volunteer'
      }
    }
  }

  return data
}

// Auto-assign the admin-church's tenant to newly created users
const assignTenantOnCreate: CollectionBeforeChangeHook = ({ req, operation, data }) => {
  if (operation === 'create') {
    const user = req.user as {
      role?: string
      tenants?: Array<{ tenant: number | string | { id: number | string } }>
    } | undefined
    if (user?.role === 'admin-church' && user.tenants?.length) {
      const tenantId = typeof user.tenants[0].tenant === 'object'
        ? user.tenants[0].tenant.id
        : user.tenants[0].tenant
      if (!data.tenants || data.tenants.length === 0) {
        data.tenants = [{ tenant: tenantId }]
      }
    }
  }
  return data
}

/**
 * Rattache un nouveau User à une fiche membre — un compte = une fiche, toujours.
 * Ordre de résolution : la fiche désignée par l'appelant, puis une fiche déjà
 * liée, puis une fiche de l'église qui porte le même email et n'a pas de compte,
 * et seulement en dernier recours une nouvelle fiche déduite de l'email.
 */
const autoCreateMember: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  // Skip super-admins (they don't belong to a single church)
  if (doc.role === 'super-admin') return doc

  // Get the tenant ID from the new user's tenants array
  const tenants = doc.tenants as Array<{ tenant: number | string | { id: number | string } }> | undefined
  if (!tenants?.length) return doc

  const tenantId = Number(
    typeof tenants[0].tenant === 'object'
      ? (tenants[0].tenant as { id: number | string }).id
      : tenants[0].tenant,
  )

  const linkMember = (memberId: number | string) =>
    req.payload.update({
      collection: 'members',
      id: memberId,
      data: { user: doc.id },
      overrideAccess: true,
      req,
    })

  // 1. L'appelant a déjà la fiche à rattacher (création de compte depuis une fiche membre)
  const linkMemberId = req.context.linkMemberId as number | undefined
  if (linkMemberId) {
    await linkMember(linkMemberId)
    return doc
  }

  // 2. Une fiche pointe déjà sur ce compte : rien à faire
  const existing = await req.payload.find({
    collection: 'members',
    where: { user: { equals: doc.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })

  if (existing.docs.length > 0) return doc

  // 3. Une fiche de l'église porte déjà cet email sans compte : on la rattache
  //    plutôt que d'en créer une seconde. `like` fait un ILIKE %…% côté Postgres,
  //    d'où le filtrage exact ensuite (members.email n'est pas indexé unique).
  const email = ((doc.email as string) || '').toLowerCase().trim()
  const sameEmail = await req.payload.find({
    collection: 'members',
    where: { church: { equals: tenantId }, email: { like: email } },
    limit: 20,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const orphan = sameEmail.docs.find(
    (m) => !m.user && m.email?.toLowerCase().trim() === email,
  )
  if (orphan) {
    await linkMember(orphan.id)
    return doc
  }

  // 4. Aucune fiche existante : on en crée une à partir de l'email
  const emailParts = email.split('@')[0].split('.')
  const firstName = emailParts[0]?.charAt(0).toUpperCase() + (emailParts[0]?.slice(1) || '')
  const lastName = emailParts[1]
    ? emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1)
    : ''

  await req.payload.create({
    collection: 'members',
    data: {
      firstName,
      lastName: lastName || firstName,
      email,
      churchRole: 'membre',
      user: doc.id,
      church: tenantId,
    },
    overrideAccess: true,
    req,
  })

  return doc
}

// Durée du lien de mot de passe : 48h quand un admin crée le compte, 3h pour un renouvellement.
// L'endpoint public accepte `expiration` dans le body, on ne l'honore donc que pour un admin
// connecté — ou pour un appel serveur qui pose explicitement `context.isSignupLink`.
const setPasswordLinkExpiration: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (operation !== 'forgotPassword') return args
  const role = (req.user as { role?: string } | null)?.role
  const isAdmin = role === 'super-admin' || role === 'admin-church'
  const isSignup =
    req.context.isSignupLink === true ||
    (isAdmin && (args as { expiration?: number }).expiration === SIGNUP_LINK_EXPIRATION)
  ;(args as { expiration?: number }).expiration = isSignup ? SIGNUP_LINK_EXPIRATION : RESET_LINK_EXPIRATION
  req.context.passwordLinkIsSignup = isSignup
  return args
}

// Update lastLogin timestamp on every login (no req to avoid re-triggering role validation)
const updateLastLogin: CollectionAfterLoginHook = async ({ req, user }) => {
  await req.payload.update({
    collection: 'users',
    id: user.id,
    data: { lastLogin: new Date().toISOString() },
    overrideAccess: true,
  }).catch(() => null)
  return user
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 600000,
    forgotPassword: {
      generateEmailSubject: (args) =>
        args?.req?.context.passwordLinkIsSignup
          ? 'Définissez votre mot de passe — Narthex'
          : 'Réinitialisez votre mot de passe — Narthex',
      generateEmailHTML: async (args) => {
        const token = args?.token
        const user = args?.user
        const req = args?.req

        // Résoudre le custom domain de la church pour rediriger l'utilisateur
        let baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
        if (req && user?.tenants?.length) {
          const tenantId = typeof user.tenants[0].tenant === 'object'
            ? user.tenants[0].tenant.id
            : user.tenants[0].tenant
          if (tenantId) {
            const church = await req.payload.findByID({
              collection: 'churches',
              id: tenantId,
              depth: 0,
              overrideAccess: true,
            }).catch(() => null)
            const customDomain = church?.domain as string | undefined
            if (customDomain) {
              baseUrl = `https://${customDomain}`
            }
          }
        }

        const url = `${baseUrl}/login/reset-password?token=${token}`
        if (req?.context.passwordLinkIsSignup) {
          return `
            <h2>Bienvenue sur Narthex</h2>
            <p>Cliquez sur le lien ci-dessous pour définir votre mot de passe :</p>
            <p><a href="${url}">Définir mon mot de passe</a></p>
            <p>Ce lien expire dans 48 heures.</p>
            <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
          `
        }
        return `
          <h2>Réinitialisation de votre mot de passe</h2>
          <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
          <p><a href="${url}">Réinitialiser mon mot de passe</a></p>
          <p>Ce lien expire dans 3 heures.</p>
          <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        `
      },
    },
  },
  hooks: {
    beforeOperation: [setPasswordLinkExpiration],
    beforeChange: [enforceAllowedRole, assignTenantOnCreate],
    afterChange: [autoCreateMember],
    // afterLogin: [updateLastLogin], // TODO: fix infinite loop
  },
  access: {
    admin: ({ req }) => isSuperAdminCheck(req.user),
    read: belongsToChurch,
    create: canCreateUser,
    update: updateScopedToTenant,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      saveToJWT: true,
      label: 'Rôle',
      options: [
        { label: 'Super-Admin', value: 'super-admin' },
        { label: 'Admin Église', value: 'admin-church' },
        { label: 'Bénévole', value: 'volunteer' },
      ],
      defaultValue: 'volunteer',
      access: {
        update: canEditRole,
      },
    },
    {
      name: 'lastLogin',
      type: 'date',
      label: 'Dernière connexion',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
    },
    // Le champ 'tenants' (array de {tenant: church_id}) est injecté
    // automatiquement par @payloadcms/plugin-multi-tenant
  ],
}
