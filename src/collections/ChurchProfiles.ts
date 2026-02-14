import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'

export const ChurchProfiles: CollectionConfig = {
  slug: 'church-profiles',
  admin: {
    useAsTitle: 'id',
    group: 'Église',
    description: 'Contenu public : présentation, horaires, contact',
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'description',
      type: 'textarea',
      label: 'Description de l\'église',
      admin: {
        description: 'Texte de présentation affiché sur la page « À propos » (2-3 paragraphes)',
        rows: 6,
      },
    },
    {
      name: 'address',
      type: 'group',
      label: 'Adresse',
      fields: [
        {
          name: 'street',
          type: 'text',
          label: 'Rue',
        },
        {
          name: 'postalCode',
          type: 'text',
          label: 'Code postal',
        },
        {
          name: 'city',
          type: 'text',
          label: 'Ville',
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Contact',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Email de contact',
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Téléphone',
          admin: {
            description: 'Ex: 01 23 45 67 89',
          },
        },
        {
          name: 'website',
          type: 'text',
          label: 'Site web externe',
          admin: {
            description: 'URL complète (ex: https://exemple.com)',
          },
        },
      ],
    },
    {
      name: 'services',
      type: 'array',
      label: 'Horaires des cultes',
      admin: {
        description: 'Cultes réguliers (dimanche matin, jeudi soir, etc.)',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Type de culte',
          admin: {
            description: 'Ex: Culte dominical, Prière du jeudi',
          },
        },
        {
          name: 'day',
          type: 'select',
          required: true,
          label: 'Jour',
          options: [
            { label: 'Lundi', value: 'monday' },
            { label: 'Mardi', value: 'tuesday' },
            { label: 'Mercredi', value: 'wednesday' },
            { label: 'Jeudi', value: 'thursday' },
            { label: 'Vendredi', value: 'friday' },
            { label: 'Samedi', value: 'saturday' },
            { label: 'Dimanche', value: 'sunday' },
          ],
        },
        {
          name: 'time',
          type: 'text',
          required: true,
          label: 'Heure',
          admin: {
            placeholder: 'HH:mm',
            description: 'Format 24h (ex: 10:30)',
          },
        },
      ],
    },
    {
      name: 'social',
      type: 'group',
      label: 'Réseaux sociaux',
      fields: [
        {
          name: 'facebook',
          type: 'text',
          label: 'Facebook',
          admin: {
            placeholder: 'https://facebook.com/votre-page',
          },
        },
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram',
          admin: {
            placeholder: 'https://instagram.com/votre-compte',
          },
        },
        {
          name: 'youtube',
          type: 'text',
          label: 'YouTube',
          admin: {
            placeholder: 'https://youtube.com/@votre-chaine',
          },
        },
      ],
    },
  ],
}
