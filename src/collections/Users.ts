import type {
  Access,
  CollectionAfterChangeHook,
  CollectionAfterLoginHook,
  CollectionConfig,
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  FieldAccess,
  Where,
} from 'payload'
import { APIError } from 'payload'
import { isSuperAdmin, isSuperAdminCheck, belongsToChurch, getUserTenantIDs } from '../access'
import { RESET_LINK_EXPIRATION, SIGNUP_LINK_EXPIRATION } from '../lib/password-link'
import { generatePasswordLinkEmail } from '../lib/emails/password-link'

/**
 * Un bénévole ne gère que son propre compte ; un admin gère ceux de son église.
 * Sans la restriction au seul titulaire, tout membre pouvait modifier l'email ou
 * le mot de passe de n'importe quel compte de l'église — seul `role` était
 * protégé — et donc prendre la main sur un compte admin.
 */
const updateScopedToTenant: Access = ({ req: { user } }) => {
  if (!user) return false
  const u = user as { id?: number; role?: string }
  if (u.role === 'super-admin') return true
  const tenantIDs = getUserTenantIDs(user)
  const scope: Where =
    u.role === 'admin-church' && tenantIDs.length > 0
      ? { 'tenants.tenant': { in: tenantIDs } }
      : { id: { equals: u.id } }
  return scope
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
      // On remet le rôle d'origine au lieu de le supprimer : à ce stade Payload a
      // déjà fusionné le document dans `data`, et un `role` absent échoue ensuite
      // à la validation `required` — toute mise à jour de son propre compte par
      // un admin-church partait en erreur, même sans toucher au rôle.

      // Cannot change own role
      if (originalDoc?.id === currentUser.id) {
        data.role = originalDoc.role
        return data
      }

      // Cannot modify a super-admin's role
      if (originalDoc?.role === 'super-admin') {
        data.role = originalDoc.role
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

/**
 * Le mot de passe n'appartient qu'à son titulaire, et un compte super-admin
 * n'est modifiable que par un super-admin. Un admin qui veut dépanner un membre
 * lui envoie un lien de réinitialisation plutôt que de choisir son mot de passe.
 */
const protectCredentials: CollectionBeforeChangeHook = ({ req, operation, data, originalDoc }) => {
  if (operation !== 'update') return data

  const currentUser = req.user as { id?: number; role?: string } | undefined
  // Pas d'utilisateur : appel serveur de confiance (acceptation d'invitation…).
  if (!currentUser || currentUser.role === 'super-admin') return data
  if (originalDoc?.id === currentUser.id) return data

  if (originalDoc?.role === 'super-admin') {
    throw new APIError('Un compte super-admin ne peut être modifié que par un super-admin.', 403)
  }

  if (data.password !== undefined) {
    throw new APIError(
      "Le mot de passe ne se change que depuis le compte concerné. Envoyez plutôt un lien de réinitialisation.",
      403,
    )
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

/**
 * Horodate la connexion. `req` est transmis pour rester dans la transaction du
 * login : une transaction séparée se bloquerait sur la ligne que la connexion
 * vient de verrouiller.
 *
 * Écriture directe par l'adaptateur, comme Payload le fait pour la session et
 * les tentatives de connexion — surtout pas `payload.update` : s'il échoue
 * (hook, validation), il annule la transaction portée par `req`, donc celle du
 * login. La session tout juste créée disparaît alors que la réponse reste un
 * 200 avec un token, et l'utilisateur est renvoyé sur /login sans message.
 * Un `.catch` n'y change rien, l'annulation a déjà eu lieu.
 */
const updateLastLogin: CollectionAfterLoginHook = async ({ req, user }) => {
  await req.payload.db.updateOne({
    collection: 'users',
    id: user.id,
    // updatedAt: null — une connexion n'est pas une modification du compte
    data: { lastLogin: new Date().toISOString(), updatedAt: null },
    req,
    returning: false,
  })
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
        let churchName: string | undefined
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
            churchName = church?.name as string | undefined
          }
        }

        // `signup=1` ne sert qu'aux libellés de la page : c'est le token qui fait foi.
        const isSignup = req?.context.passwordLinkIsSignup === true
        const url = `${baseUrl}/login/reset-password?token=${token}${isSignup ? '&signup=1' : ''}`
        return generatePasswordLinkEmail({ url, isSignup, churchName })
      },
    },
  },
  hooks: {
    beforeOperation: [setPasswordLinkExpiration],
    beforeChange: [protectCredentials, enforceAllowedRole, assignTenantOnCreate],
    afterChange: [autoCreateMember],
    afterLogin: [updateLastLogin],
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
