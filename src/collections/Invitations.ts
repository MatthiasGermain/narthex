import type {
  CollectionConfig,
  CollectionBeforeChangeHook,
  CollectionAfterChangeHook,
} from 'payload'
import { isAdmin, isSuperAdmin, getUserTenantIDs, ownChurchFilterOptions } from '../access'
import { generateInvitationEmail } from '../lib/emails/invitation'

/** Génère token + expiresAt, assigne invitedBy et church, valide les doublons */
const prepareInvitation: CollectionBeforeChangeHook = async ({ req, operation, data }) => {
  if (operation !== 'create') return data

  const user = req.user as {
    id?: number
    role?: string
    tenants?: Array<{ tenant: number | string | { id: number | string } }>
  } | undefined

  if (!user) throw new Error('Non authentifié')

  // Les emails des comptes sont minusculés par Payload : on aligne pour que les
  // contrôles de doublon ci-dessous ne soient pas contournés par la casse.
  if (typeof data.email === 'string') data.email = data.email.toLowerCase().trim()

  // Auto-set invitedBy
  data.invitedBy = user.id

  // L'église vient toujours du tenant de l'admin, jamais du client : sinon un
  // admin de A peut créer chez B une invitation qui donne les droits admin.
  if (user.role !== 'super-admin') {
    const tenantIDs = getUserTenantIDs(user)
    if (tenantIDs.length === 0) throw new Error('Aucune église associée')
    data.church = tenantIDs[0]
  } else if (!data.church) {
    throw new Error('Précisez l\'église de cette invitation')
  }

  // Générer token et expiration
  data.token = crypto.randomUUID()
  data.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  // Vérifier qu'aucun User n'existe déjà avec cet email
  const existingUser = await req.payload.find({
    collection: 'users',
    where: { email: { equals: data.email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existingUser.docs.length > 0) {
    throw new Error('Un compte existe déjà avec cet email')
  }

  // Vérifier qu'aucune invitation pending n'existe pour ce combo email+church
  const existingInvitation = await req.payload.find({
    collection: 'invitations',
    where: {
      email: { equals: data.email },
      church: { equals: data.church },
      status: { equals: 'pending' },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existingInvitation.docs.length > 0) {
    throw new Error('Une invitation est déjà en attente pour cet email')
  }

  return data
}

/** Envoie l'email d'invitation après création */
const sendInvitationEmail: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const churchId = typeof doc.church === 'object' ? (doc.church as { id: number }).id : doc.church

  // Résoudre le nom de l'église et le domaine custom
  const church = await req.payload.findByID({
    collection: 'churches',
    id: churchId,
    depth: 0,
    overrideAccess: true,
  }).catch(() => null)

  const churchName = (church?.name as string) || 'votre église'
  const customDomain = church?.domain as string | undefined
  const churchSlug = church?.slug as string | undefined

  let baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
  if (customDomain) {
    baseUrl = `https://${customDomain}`
  } else if (churchSlug && process.env.NODE_ENV === 'production') {
    baseUrl = `https://${churchSlug}.narthex.dev`
  }

  const html = generateInvitationEmail({
    churchName,
    token: doc.token as string,
    baseUrl,
  })

  await req.payload.sendEmail({
    to: doc.email as string,
    subject: `Rejoignez ${churchName} sur Narthex`,
    html,
  })

  return doc
}

export const Invitations: CollectionConfig = {
  slug: 'invitations',
  admin: {
    useAsTitle: 'email',
  },
  hooks: {
    beforeChange: [prepareInvitation],
    afterChange: [sendInvitationEmail],
  },
  access: {
    // Réservé aux admins : une invitation en attente porte un token utilisable
    // et un rôle attribué. Ouverte à tout membre, elle permettait de lire le
    // token, d'y passer `role: admin-church` puis de l'accepter.
    // Le plugin multi-tenant ajoute la contrainte d'église par-dessus.
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Statut',
      options: [
        { label: 'En attente', value: 'pending' },
        { label: 'Acceptée', value: 'accepted' },
        { label: 'Expirée', value: 'expired' },
      ],
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      label: 'Expire le',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Invité par',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'volunteer',
      label: 'Rôle attribué',
      options: [
        { label: 'Bénévole', value: 'volunteer' },
        { label: 'Admin Église', value: 'admin-church' },
      ],
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'Prénom',
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Nom',
    },
    {
      name: 'church',
      type: 'relationship',
      relationTo: 'churches',
      filterOptions: ownChurchFilterOptions,
      required: true,
      label: 'Église',
      admin: {
        readOnly: true,
      },
    },
  ],
}
