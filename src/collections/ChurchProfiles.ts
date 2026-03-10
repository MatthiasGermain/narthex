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
      name: 'visitInfo',
      type: 'group',
      label: 'Première visite',
      admin: {
        description: 'Informations pour les nouveaux visiteurs',
      },
      fields: [
        {
          name: 'duration',
          type: 'text',
          label: 'Durée du culte',
          admin: {
            placeholder: 'Ex: Environ 1h30',
          },
        },
        {
          name: 'serviceFlow',
          type: 'textarea',
          label: 'Déroulé du culte',
          admin: {
            description: 'Décrivez le déroulement type du culte (louange, prédication, etc.)',
            rows: 3,
          },
        },
        {
          name: 'childrenInfo',
          type: 'textarea',
          label: 'Accueil des enfants',
          admin: {
            description: 'Garderie, école du dimanche, tranches d\'âge, etc.',
            rows: 3,
          },
        },
        {
          name: 'parking',
          type: 'text',
          label: 'Parking / accès',
          admin: {
            placeholder: 'Ex: Parking gratuit sur place, accès PMR',
          },
        },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      label: 'Questions fréquentes',
      admin: {
        description: 'FAQ affichée sur la page « Première visite »',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          label: 'Question',
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
          label: 'Réponse',
          admin: {
            rows: 3,
          },
        },
      ],
    },
    {
      name: 'denomination',
      type: 'text',
      label: 'Affiliation / courant',
      admin: {
        placeholder: 'Ex: Église évangélique, Baptiste, Assemblée de Dieu',
      },
    },
    {
      name: 'beliefs',
      type: 'array',
      label: 'Confession de foi',
      admin: {
        description: 'Points de foi affichés sur la page publique',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Thème',
          admin: {
            placeholder: 'Ex: La Bible, Dieu, Le salut, Le baptême',
          },
        },
        {
          name: 'content',
          type: 'textarea',
          required: true,
          label: 'Énoncé',
          admin: {
            rows: 3,
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
