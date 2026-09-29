import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionBeforeDeleteHook,
  CollectionConfig,
} from 'payload'
import { APIError } from 'payload'
import { isAdmin, readOwnChurch } from '../access'
import { CHURCH_ROLE_OPTIONS } from '../lib/church-roles'
import { assignCreatedBy } from './hooks'

const getRelId = (value: unknown): number | null => {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object') return (value as { id?: number }).id ?? null
  return null
}

/** Les emails des comptes sont minusculés par Payload : on aligne les fiches membres. */
const normalizeEmail: CollectionBeforeChangeHook = ({ data }) => {
  if (typeof data.email === 'string') {
    data.email = data.email.toLowerCase().trim() || null
  }
  return data
}

/**
 * Un compte utilisateur ne peut être rattaché qu'à une seule fiche membre.
 * Seul un rattachement qui change est contrôlé : les doublons hérités des
 * anciens bugs restent modifiables le temps d'être nettoyés.
 */
const enforceSingleUserLink: CollectionBeforeChangeHook = async ({ req, data, originalDoc }) => {
  const userId = getRelId(data.user)
  if (!userId) return data
  if (userId === getRelId(originalDoc?.user)) return data

  const { docs } = await req.payload.find({
    collection: 'members',
    where: { user: { equals: userId } },
    limit: 2,
    depth: 0,
    overrideAccess: true,
    req,
  })

  const other = docs.find((m) => m.id !== originalDoc?.id)
  if (other) {
    throw new APIError(
      `Ce compte utilisateur est déjà rattaché à la fiche de ${other.firstName} ${other.lastName}.`,
      400,
    )
  }
  return data
}

/** L'email d'une fiche avec compte est aussi son identifiant de connexion. */
const requireEmailWhenLinked: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const userId = getRelId('user' in data ? data.user : originalDoc?.user)
  if (userId && 'email' in data && !data.email) {
    throw new APIError(
      "Ce membre a un compte Narthex : son email est aussi son identifiant de connexion et ne peut pas être vidé.",
      400,
    )
  }
  return data
}

/** Une fiche et son compte partagent la même identité : l'email suit. */
const syncLinkedUserEmail: CollectionAfterChangeHook = async ({ req, doc, previousDoc, operation }) => {
  if (operation !== 'update') return doc

  const userId = getRelId(doc.user)
  const email = (doc.email as string | null)?.toLowerCase().trim()
  if (!userId || !email) return doc
  if (email === (previousDoc?.email as string | null)?.toLowerCase().trim()) return doc

  try {
    await req.payload.update({
      collection: 'users',
      id: userId,
      data: { email },
      overrideAccess: true,
      req,
    })
  } catch (err) {
    req.payload.logger.error(
      `Synchronisation de l'email du compte ${userId} (membre ${doc.id}) échouée : ${err}`,
    )
    throw new APIError(
      `L'email ${email} ne peut pas être appliqué au compte Narthex de ce membre : il est probablement déjà utilisé.`,
      400,
    )
  }

  return doc
}

/**
 * Supprimer une fiche membre supprime son compte : on interdit donc les deux
 * cas où cette suppression en cascade serait subie plutôt que voulue.
 */
const guardLinkedAccountDeletion: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const member = await req.payload
    .findByID({ collection: 'members', id, depth: 0, overrideAccess: true, req })
    .catch(() => null)

  const userId = getRelId(member?.user)
  if (!userId) return

  const currentUser = req.user as { id?: number; role?: string } | undefined
  if (currentUser?.id === userId) {
    throw new APIError(
      'Cette fiche est liée à votre propre compte : vous ne pouvez pas la supprimer.',
      400,
    )
  }

  const linkedUser = await req.payload
    .findByID({ collection: 'users', id: userId, depth: 0, overrideAccess: true, req })
    .catch(() => null)

  if (linkedUser?.role === 'super-admin' && currentUser?.role !== 'super-admin') {
    throw new APIError('Cette fiche est liée à un compte super-admin.', 400)
  }
}

/** Cascade : la fiche partie, le compte associé n'a plus de raison d'exister. */
const deleteLinkedUser: CollectionAfterDeleteHook = async ({ req, doc }) => {
  const userId = getRelId(doc.user)
  if (!userId) return doc

  await req.payload
    .delete({ collection: 'users', id: userId, overrideAccess: true, req })
    .catch((err) => {
      req.payload.logger.error(
        `Suppression du compte ${userId} lié au membre ${doc.id} échouée : ${err}`,
      )
    })

  return doc
}

export const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    useAsTitle: 'lastName',
    defaultColumns: ['lastName', 'firstName', 'email', 'churchRole', 'church'],
  },
  hooks: {
    beforeChange: [assignCreatedBy, normalizeEmail, requireEmailWhenLinked, enforceSingleUserLink],
    afterChange: [syncLinkedUserEmail],
    beforeDelete: [guardLinkedAccountDeletion],
    afterDelete: [deleteLinkedUser],
  },
  access: {
    read: readOwnChurch,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'firstName',
          type: 'text',
          required: true,
          label: 'Prénom',
          admin: { width: '50%' },
        },
        {
          name: 'lastName',
          type: 'text',
          required: true,
          label: 'Nom',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          admin: { width: '50%' },
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Téléphone',
          admin: {
            placeholder: '06 12 34 56 78',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'churchRole',
      type: 'select',
      label: 'Rôle dans l\'église',
      options: [...CHURCH_ROLE_OPTIONS],
      defaultValue: 'membre',
    },
    {
      name: 'birthDate',
      type: 'date',
      label: 'Date de naissance',
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'Compte utilisateur',
      admin: {
        description:
          'Compte Narthex de ce membre (optionnel). Un compte ne peut être rattaché qu\'à une seule fiche, et supprimer la fiche supprime le compte.',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Créé par',
      admin: {
        readOnly: true,
        description: 'Auto-assigné au créateur',
      },
    },
    {
      name: 'church',
      type: 'relationship',
      relationTo: 'churches',
      required: true,
      index: true,
      label: 'Église',
      admin: {
        condition: (_, __, { user }) => user?.role === 'super-admin',
        description: 'Auto-assigné à votre église',
      },
    },
  ],
}
