# Narthex — Specifications Frontend Public

> Cahier des charges des pages publiques du site d'eglise.
> Design System : Spotlight (voir DESIGN_SYSTEM_COMPACT.md)

---

## Composants partages

| Composant | Detail |
|---|---|
| `PublicHeader` | Existe. Glassmorphism au scroll. Nav : Accueil, Evenements, A propos, Contact, Espace membre. StaggeredMenu mobile. |
| `PublicFooter` | **Nouveau**. Fond raisin, logo inverse, liens nav, reseaux sociaux, copyright, "Propulse par Narthex". |
| `PublicPageHero` | **Nouveau**. H1 (Avenir Black uppercase) + sous-titre + fond cream + AnimatedUnderline. Reutilisable sur chaque page. |
| `SpotlightButton` | **Nouveau**. Variante outline rounded-full : sunglow, violet, raisin, white. Inversion au hover. |
| `SectionWrapper` | **Nouveau** (optionnel). Padding + max-width + fond configurable pour uniformiser les sections. |
| `ContactForm` | **Nouveau**. Client component : nom, email, message, POST vers `/api/contact`, toast feedback. |

---

## Phase 1 — Restyler les pages existantes + Contact

### PAGE 1 : Accueil `/`

| # | Section | Fond | Contenu |
|---|---------|------|---------|
| 1 | Header | Transparent → glassmorphism | Logo, nav, CTA "Espace membre", StaggeredMenu mobile |
| 2 | Hero | `bg-cream` | H1 nom eglise (Avenir Black uppercase). Sous-titre description courte (max 200 car). 2 boutons outline : "Nos evenements" (sunglow) + "Planifier ma visite" (violet). AnimatedUnderline sur mot-cle du H1 |
| 3 | Horaires cultes | `bg-sunglow/10` | Icone horloge. Jour + label + heure par culte. Horizontal desktop, empile mobile. Masque si pas de services |
| 4 | Prochains evenements | `bg-cream/50` | H2 "Prochains evenements". Grille 1→3 col. Carte : image (4:3), titre, date, lieu. Max 3. Lien "Voir tous →" |
| 5 | Infos pratiques | `bg-cream` | Grille 2-3 col. Blocs icone + texte : adresse, email, telephone. Conditionnel par champ |
| 6 | Footer | `bg-raisin` | (composant partage) |

### PAGE 2 : Evenements `/events`

| # | Section | Fond | Contenu |
|---|---------|------|---------|
| 1 | Header | (partage) | |
| 2 | Titre | `bg-cream` | H1 "Evenements". Sous-titre "Decouvrez nos prochaines activites" |
| 3 | A venir | `bg-cream/50` | Grille 1→2→3 col. Carte : image (16:9), titre, date formatee, lieu. Hover shadow + scale. Clic → detail |
| 4 | Passes | `bg-violet/10` | H2 "Evenements passes". Liste compacte sans image, opacite reduite |
| 5 | Empty state | `bg-cream/50` | Icone CalendarX + "Aucun evenement a venir pour le moment." |
| 6 | Footer | (partage) | |

### PAGE 3 : Detail evenement `/events/[id]`

| # | Section | Fond | Contenu |
|---|---------|------|---------|
| 1 | Header | (partage) | |
| 2 | Image hero | Pleine largeur | Image banniere (21:9 desktop, 16:9 mobile). Fallback gradient raisin→violet |
| 3 | Infos | `bg-cream` | H1 titre. Badges : date, heure, lieu. Description. Bouton retour "← Tous les evenements" |
| 4 | Footer | (partage) | |

### PAGE 4 : A propos `/about`

| # | Section | Fond | Contenu |
|---|---------|------|---------|
| 1 | Header | (partage) | |
| 2 | Hero titre | `bg-cream` | H1 "A propos". Sous-titre "Apprenez a nous connaitre" |
| 3 | Qui sommes-nous | `bg-cream/50` | H2 + texte description libre. AnimatedUnderline sur H2 |
| 4 | Nos cultes | `bg-cream` | H2 "Nos cultes". Cartes : jour, label, heure |
| 5 | Nous trouver | `bg-cream/50` | H2 "Nous trouver". Adresse complete + icone MapPin |
| 6 | Nous contacter | `bg-cream` | H2 "Contact". Email, telephone, site web. Bouton "Nous ecrire →" vers /contact |
| 7 | Reseaux sociaux | `bg-cream/50` | Boutons outline FB, Instagram, YouTube |
| 8 | Footer | (partage) | |

### PAGE 5 : Contact `/contact` (nouvelle)

| # | Section | Fond | Contenu |
|---|---------|------|---------|
| 1 | Header | (partage) | |
| 2 | Titre | `bg-cream` | H1 "Nous contacter". Sous-titre "Une question ? N'hesitez pas a nous ecrire." |
| 3 | Formulaire + Infos | `bg-cream/50` | 2 colonnes desktop (1 col mobile). Gauche : form (Nom, Email, Message, bouton sunglow). Droite : adresse, email, telephone, horaires |
| 4 | Footer | (partage) | |

---

## Phase 2 — Nouvelles pages

### PAGE 6 : Predications `/sermons` (nouvelle)

| # | Section | Fond | Contenu |
|---|---------|------|---------|
| 1 | Header | (partage) | |
| 2 | Titre | `bg-cream` | H1 "Predications". Sous-titre "Retrouvez nos enseignements" |
| 3 | Derniere predication | `bg-cream/50` | Carte large mise en avant. Titre, predicateur, date, reference biblique. Player audio ou embed video |
| 4 | Archives | `bg-cream` | Grille 1→2 col. Carte : titre, predicateur (nom + photo mini), date, icone audio/video. Clic → detail. Filtres : serie, predicateur |
| 5 | Empty state | | "Aucune predication disponible pour le moment." |
| 6 | Footer | (partage) | |

### PAGE 7 : Detail predication `/sermons/[id]` (nouvelle)

| # | Section | Fond | Contenu |
|---|---------|------|---------|
| 1 | Header | (partage) | |
| 2 | Contenu | `bg-cream` | H1 titre. Metadonnees : predicateur, date, serie, reference biblique. Player audio (HTML5 custom). Video embed (YouTube/Vimeo 16:9). Description. Bouton retour |
| 3 | Navigation | `bg-cream/50` | "← Precedente" / "Suivante →" avec titre |
| 4 | Footer | (partage) | |

### PAGE 8 : Premiere visite `/visit` (nouvelle)

| # | Section | Fond | Contenu |
|---|---------|------|---------|
| 1 | Header | (partage) | |
| 2 | Hero | `bg-cream` | H1 "Votre premiere visite". Sous-titre chaleureux |
| 3 | A quoi s'attendre | `bg-cream/50` | Grille 3-4 blocs icone : Duree (Clock), Ambiance (Music), Tenue (Shirt), Enfants (Baby) |
| 4 | Horaires et lieu | `bg-cream` | Horaires cultes + adresse complete |
| 5 | Stationnement | `bg-cream/50` | Texte libre configurable (parking, transports) |
| 6 | FAQ | `bg-cream` | Accordeon Q/R configurables depuis le CMS |
| 7 | CTA | `bg-raisin text-cream` | Banniere "Pret a nous rendre visite ?" + bouton outline white → /contact |
| 8 | Footer | (partage) | |

### PAGE 9 : Donner `/give` (nouvelle)

| # | Section | Fond | Contenu |
|---|---------|------|---------|
| 1 | Header | (partage) | |
| 2 | Titre | `bg-cream` | H1 "Donner". Sous-titre sur la generosite |
| 3 | Options de don | `bg-cream/50` | Texte explicatif. Bouton(s) outline vers plateforme(s) externe(s) (URL configurable). Icone ExternalLink |
| 4 | Infos pratiques | `bg-cream` | Texte libre optionnel (cheque, virement). RIB/IBAN optionnel |
| 5 | Footer | (partage) | |

---

## Donnees CMS necessaires (nouveaux champs)

| Collection | Champ | Type | Usage |
|---|---|---|---|
| ChurchProfiles | `visitInfo.duration` | text | Page Premiere visite |
| ChurchProfiles | `visitInfo.atmosphere` | text | Page Premiere visite |
| ChurchProfiles | `visitInfo.dressCode` | text | Page Premiere visite |
| ChurchProfiles | `visitInfo.childrenInfo` | text | Page Premiere visite |
| ChurchProfiles | `visitInfo.parking` | textarea | Stationnement |
| ChurchProfiles | `faq` | array [{question, answer}] | FAQ premiere visite |
| ChurchProfiles | `givingUrl` | text | Lien plateforme de don |
| ChurchProfiles | `givingDescription` | textarea | Texte explicatif dons |
| **Sermons** (nouvelle) | `title` | text | Titre predication |
| **Sermons** (nouvelle) | `date` | date | Date |
| **Sermons** (nouvelle) | `preacher` | rel → members | Predicateur |
| **Sermons** (nouvelle) | `series` | text | Nom de la serie |
| **Sermons** (nouvelle) | `description` | textarea | Resume |
| **Sermons** (nouvelle) | `audioUrl` | text | URL fichier audio |
| **Sermons** (nouvelle) | `videoUrl` | text | URL YouTube/Vimeo |
| **Sermons** (nouvelle) | `scripture` | text | Reference biblique |
| **Sermons** (nouvelle) | `visibility` | select | public / internal |
| **Sermons** (nouvelle) | `church` | rel → churches | Tenant |

---

## Navigation publique (mise a jour)

Accueil · Evenements · Predications · A propos · Premiere visite · Contact · Donner · [Espace membre]

Note : "Donner" et "Premiere visite" peuvent etre affiches conditionnellement (si givingUrl / visitInfo configures).
