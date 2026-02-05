---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Narthex - plateforme SaaS multi-tenant Factory pour églises et projets chrétiens francophones'
session_goals: 'Explorer les fonctionnalités clés à offrir - Brainstormer sur l expérience utilisateur pour des bénévoles non-techniques'
selected_approach: 'ai-recommended'
techniques_used: ['Role Playing', 'SCAMPER Method', 'Reverse Brainstorming']
ideas_generated: [27 fonctionnalités, 10 principes UX, 9 décisions architecturales]
context_file: '_bmad/bmm/data/project-context-template.md'
facilitation_notes: 'Session très productive - Matthias a une vision claire du produit. Découverte majeure: le culte comme objet central, séparation admin/interface église, modèle agence pas self-service.'
technique_execution_complete: true
session_status: 'completed'
workflow_completed: true
priorities_selected: ['Expérience Bénévole Ultra-Simplifiée', 'Architecture Technique Différenciante', 'Séparation Admin Payload / Interface Église']
---

# Brainstorming Session Results

**Facilitateur:** Matthias
**Date:** 2026-02-04

## Session Overview

**Sujet :** Narthex — plateforme SaaS multi-tenant "Factory" pour églises et projets chrétiens francophones, remplaçant WordPress
**Objectifs :**
- Explorer les fonctionnalités clés à offrir
- Brainstormer sur l'expérience utilisateur pour des bénévoles non-techniques

### Contexte

Narthex est une solution "Factory" (SaaS Multi-tenant) destinée aux églises et projets chrétiens francophones. L'objectif est de remplacer les sites WordPress obsolètes et complexes par une plateforme moderne, ultra-rapide et gérable par des bénévoles non-techniques. Cible principale : églises protestantes. Modèle agence : l'équipe de communication crée et configure le site, puis le remet à l'église pour la gestion quotidienne.

### Domaines d'exploration

- Problèmes utilisateurs et points de douleur
- Idées de fonctionnalités et capacités
- Approches techniques
- Expérience utilisateur
- Modèle économique et valeur
- Différenciation marché
- Risques et défis techniques
- Métriques de succès

## Technique Selection

**Approche :** Techniques recommandées par l'IA
**Contexte d'analyse :** Narthex avec focus sur fonctionnalités clés et UX bénévoles non-techniques

**Techniques recommandées :**

- **Role Playing :** Incarner les différents profils d'utilisateurs d'église pour découvrir les besoins réels par persona
- **SCAMPER Method :** Passer WordPress au crible des 7 lenses pour innover systématiquement sur les fonctionnalités
- **Reverse Brainstorming :** Identifier comment rendre la plateforme inutilisable pour révéler les pièges UX à éviter

**Logique IA :** Comprendre les utilisateurs (Phase 1) → Générer les fonctionnalités (Phase 2) → Valider l'accessibilité (Phase 3)

## Technique Execution Results

### Phase 1 : Role Playing — Personas d'église protestante

**Personas explorées :** Marie-Claire (secrétaire bénévole, 58 ans), Thomas (responsable louange, 35 ans), Paul (pasteur, 45 ans), Amina (nouvelle visiteuse, 33 ans)

**Découverte majeure :** Le culte du dimanche est l'objet central de l'application. Toute la semaine, les différents responsables enrichissent la fiche du culte en parallèle.

**Idées générées :**

#### Fonctionnalités identifiées

| # | Fonctionnalité | Description | Statut |
|---|---------------|-------------|--------|
| 1 | Interface Collaborateur/Membre | Espace connecté distinct du site public, orienté "actions disponibles" | MVP |
| 2 | Annonces liées au calendrier | Annonces contextuellement liées aux événements à venir, suggestions automatiques | MVP |
| 3 | Gestion des membres impliqués & Accueil | Annuaire des membres actifs avec rôles/ministères | MVP |
| 4 | Répertoire de Louange & Liturgie | Base de données des chants avec structure riche, création de set-lists | MVP |
| 5 | Logistique & Réservation de salles | Calendrier des salles, réservation, visualisation des conflits | MVP |
| 6 | Secrétariat & Documents pratiques | Mini-GED simplifié pour la vie administrative de l'église | MVP |
| 7 | Planning du culte connecté | Déroulé structuré du culte lié aux responsables et ressources | MVP |
| 8 | Responsables par pôle | Chaque pôle a ses responsables enregistrés, rôles flexibles (président de culte peut choisir les chants) | MVP |
| 9 | Bibliothèque de chants collaborative | Base partagée avec couplets, refrains, tonalité, tempo, auteur, licence | MVP |
| 10 | Scraping intelligent de chants | Coller un lien, pré-remplissage automatique de la structure du chant | Post-MVP |
| 11 | Diffusion/Projection web | Set-list en mode projection plein écran, contrôlable depuis téléphone/tablette | Post-MVP |
| 12 | Vue "Ce dimanche" | Tableau de bord synthétique du culte à venir | MVP |
| 13 | Section "Première visite" | Page dédiée aux nouveaux visiteurs avec infos pratiques et ton chaleureux | MVP |
| 14 | Prédications en ligne | Archives audio/vidéo classées par date, orateur, thème, livre biblique | MVP |
| 15 | Page Confession de foi | Identité théologique de l'église | MVP |
| 16 | Présentation des activités | Fiches par activité : description, horaire, lieu, contact | MVP |
| 17 | Horaires & Accès | Adresse, carte interactive, transports, parking | MVP |
| 18 | Présentation de l'équipe / Pasteur | Visages, noms, rôles | MVP |
| 19 | Actualités / Blog | Espace éditorial distinct des annonces | MVP |
| 20 | Page de contact | Email, téléphone, formulaire simple | MVP |
| 21 | Calendrier public des événements | Vue publique des événements marqués "publics" uniquement | MVP |
| 22 | Galerie photos | Ambiance, locaux, moments communautaires | MVP |
| 23 | Liens dénominationnels | Rattachement UEELF, CNEF, FPF, ADD... | MVP |
| 24 | Intégration emailing (Mailchimp) | Connecter base membres avec outil d'emailing, auto-génération newsletter | Post-MVP |
| 25 | Intégration réseaux sociaux | Publication multicanal depuis Narthex | Futur |
| 26 | Réutilisation des contenus | Un contenu saisi une fois, propagé dans tous les contextes pertinents | MVP |
| 27 | Onboarding "prêt à habiter" | Sections standard pré-créées, le bénévole remplit au lieu de construire | MVP |

#### Éléments hors périmètre

| Élément | Raison |
|---------|--------|
| Finances / Reçus fiscaux | Post-MVP, domaine trop spécifique |
| Ministère enfants | Trop spécifique pour le MVP |
| Suivi pastoral | Carnet personnel du pasteur, hors périmètre Narthex |

#### UX Insights du Role Playing

| # | Principe | Description |
|---|---------|-------------|
| UX1 | Recherche d'actions | Chercher par verbe d'action, pas par menu technique |
| UX2 | Flux minimaliste | Écrire → Publier → Terminé. 3 étapes max. |
| UX3 | Draft/Publié sans validation | Deux états simples, confiance par défaut |
| UX4 | Fiche du culte comme objet central | Le culte est le pivot, tout converge vers lui |
| UX5 | Planification parallèle | Chacun contribue quand il veut, pas de séquencement imposé |
| UX6 | Parcours nouveau visiteur | Entonnoir d'accueil digital sur le site public |
| UX7 | Site public = vitrine sans friction | Aucun formulaire, aucune inscription, accès libre |

### Phase 2 : SCAMPER — Innovation systématique sur WordPress

**Cible :** L'expérience WordPress actuelle des églises passée au crible des 7 lenses

**Décisions architecturales majeures :**

| # | Décision | Description |
|---|---------|-------------|
| A1 | Séparation totale Admin/Interface église | Deux mondes étanches : Payload CMS pour le dev, interface simplifiée pour l'église |
| A2 | Modules activables/désactivables | Chaque fonctionnalité est un module qu'on active ou non par tenant |
| A3 | Design system ecclésial | Plus de thèmes génériques, un design system optimisé pour les églises |
| A4 | Contenus typés | Fini la distinction page/article — prédication, annonce, activité, événement |
| A5 | Élimination de la charge technique | Mises à jour, plugins, hébergement, sauvegardes — tout invisible pour l'église |
| A6 | Modèle agence/Factory | L'équipe de comm crée le site, pas self-service |
| A7 | Templates de design multiples | Base commune + templates prédéfinis + personnalisation par église |
| A8 | Double approche design | Sur mesure (défaut) : template + zones flexibles / Rapide (fallback) : templates pré-construits |
| A9 | Zones flexibles pour le sur mesure | Composants communs agencés librement par le dev |

**Insights SCAMPER :**

- **Substituer :** Modules activables, design system, contenus typés
- **Combiner :** Annonces↔Calendrier, Prédication↔Culte, Activités↔Salles
- **Adapter :** Inspirations Notion/Canva/Doctolib (à explorer au design)
- **Modifier :** Éditeur de contenu ultra-simplifié (pas de Gutenberg)
- **Éliminer :** Mises à jour, plugins, hébergement, thèmes, back-office technique
- **réUtiliser :** Un contenu saisi une fois, propagé partout automatiquement
- **Renverser :** Modèle agence, double offre custom/template

### Phase 3 : Reverse Brainstorming — Charte UX par inversion

**Question :** "Comment rendre Narthex absolument inutilisable pour Marie-Claire ?"

**Principes UX extraits :**

| # | Sabotage identifié | Principe UX Narthex |
|---|-------------------|---------------------|
| 1 | WYSIWYG menteur (écart édition/rendu) | **Édition = Rendu final.** Zéro surprise entre ce qu'on écrit et ce qu'on voit. |
| 2 | 47 icônes et 12 menus | **Interface minimale.** Seuls les modules activés apparaissent. |
| 3 | 6 étapes pour une annonce | **3 clics maximum.** Trouver → Rédiger → Publier. |
| 4 | Jargon technique partout | **Vocabulaire de l'église.** "Annonce", "Prédication", "Culte" — jamais "Post", "Slug", "Widget". |
| 5 | Aucun retour après action | **Confirmation visible et rassurante.** Feedback immédiat après chaque action. |
| 6 | Retrouver un contenu dans 200 articles | **Recherche et filtres intelligents.** Retrouver n'importe quoi en 2 secondes. |
| 7 | Suppression sans retour | **Filet de sécurité.** Corbeille, annulation, confirmation avant suppression. |
| 8 | Mélange français/anglais | **100% dans la langue de l'église.** Interface intégralement cohérente. |
| 9 | Chargement lent | **Ultra-rapide.** Architecture moderne, pas de plugins, chargement instantané. |
| 10 | Peur de casser le site | **Sécurité psychologique.** Le bénévole ne peut agir que dans son périmètre. Impossible de casser le site. |

## Creative Facilitation Narrative

Session de brainstorming très productive avec Matthias. Trois techniques complémentaires ont permis de couvrir le sujet en profondeur : le Role Playing a révélé les besoins réels des personas (Marie-Claire, Thomas, Paul, Amina), le SCAMPER a systématiquement déconstruit WordPress pour innover, et le Reverse Brainstorming a produit une charte UX solide par inversion.

**Découverte clé de la session :** Le culte du dimanche comme objet central de l'application, avec la fiche "Ce dimanche" comme vue pivot. Également : la clarification du modèle agence (pas self-service) et la double approche design (sur mesure par défaut, templates en fallback).

**Forces créatives de Matthias :** Vision produit claire, capacité à délimiter le périmètre (hors périmètre assumé pour finances, ministère enfants, suivi pastoral), pragmatisme MVP.

### Session Highlights

**Breakthrough moments :**
- Le culte comme objet central (pas le calendrier, pas les annonces — le culte)
- La séparation totale admin Payload / interface église
- Le modèle agence vs self-service
- L'édition = rendu comme principe UX #1

---

## Idea Organization and Prioritization

### Organisation Thématique

**5 thèmes majeurs** identifiés à partir des 46 éléments générés :

#### Thème 1 : Le Culte comme Objet Central
*Focus : L'architecture applicative pivote autour du culte du dimanche*

- Vue "Ce dimanche" (tableau de bord) — Point d'entrée principal des collaborateurs
- Planning du culte connecté — Déroulé structuré lié aux responsables et ressources
- Responsables par pôle — Contribution parallèle de chaque ministère
- Répertoire de Louange & Liturgie — Base de chants avec set-lists
- Fiche du culte comme pivot (UX4) — Tout converge vers cet objet

**Pattern :** Découverte fondatrice — le culte n'est pas un événement parmi d'autres, c'est l'objet central de toute l'application.

#### Thème 2 : Expérience Bénévole Ultra-Simplifiée
*Focus : Rendre la plateforme accessible aux non-techniciens*

- 3 clics maximum — Trouver → Rédiger → Publier
- Vocabulaire de l'église — "Annonce", "Prédication", pas "Post", "Slug"
- Édition = Rendu final — Zéro surprise WYSIWYG
- Sécurité psychologique — Impossible de casser le site
- Recherche par verbe d'action (UX1) — Pas de menus techniques
- Onboarding "prêt à habiter" — Sections pré-créées à remplir

**Pattern :** Charte UX anti-WordPress — chaque principe est l'inverse exact d'une frustration connue.

#### Thème 3 : Architecture Technique Différenciante
*Focus : Les décisions structurantes qui distinguent Narthex*

- Séparation Admin Payload / Interface église (A1) — Deux mondes étanches
- Modules activables/désactivables (A2) — Flexibilité par tenant
- Contenus typés (A4) — Prédication, annonce, activité — pas page/article
- Élimination de la charge technique (A5) — Mises à jour, plugins, hébergement invisibles
- Modèle agence/Factory (A6) — Pas de self-service
- Double approche design (A8) — Sur mesure par défaut, templates en fallback

**Pattern :** Architecture opinionée qui assume ses choix pour simplifier l'expérience.

#### Thème 4 : Site Public — Vitrine d'Accueil
*Focus : L'expérience du visiteur et du nouveau venu*

- Section "Première visite" — Page dédiée aux nouveaux, ton chaleureux
- Parcours nouveau visiteur (UX6) — Entonnoir d'accueil digital
- Site public sans friction (UX7) — Aucun formulaire, aucune inscription
- Prédications en ligne — Archives classées par orateur, thème, livre biblique
- Présentation équipe/Pasteur — Visages, noms, rôles
- Calendrier public des événements — Vue filtrée "publics uniquement"
- Confession de foi, Horaires & Accès — Identité et informations pratiques

**Pattern :** Le site public est une vitrine missionnaire — accueillir, rassurer, donner envie de venir.

#### Thème 5 : Gestion Quotidienne de l'Église
*Focus : Les outils du secrétariat et de la coordination*

- Annonces liées au calendrier — Suggestions automatiques contextuelles
- Gestion des membres impliqués — Annuaire avec rôles/ministères
- Logistique & Réservation de salles — Calendrier, conflits
- Secrétariat & Documents — Mini-GED simplifié
- Réutilisation des contenus — Un contenu saisi une fois, propagé partout

**Pattern :** Les tâches récurrentes du bénévole simplifiées au maximum.

### Concepts Breakthrough

| Concept | Pourquoi c'est une percée |
|---------|---------------------------|
| Le culte comme objet central | Renverse la logique CMS classique (calendrier/blog) pour une architecture métier église |
| Modèle agence, pas self-service | Assume un positionnement clair, évite la complexité du DIY |
| Édition = Rendu | Élimine la source #1 de frustration WordPress pour les bénévoles |
| Séparation totale Admin/Interface | Libère le dev (Payload) sans polluer l'expérience église |

---

## Prioritization Results

### Top 3 Priorités Sélectionnées

| # | Priorité | Portée |
|---|----------|--------|
| 1 | **Expérience Bénévole Ultra-Simplifiée** | Charte UX complète (3 clics, vocabulaire église, édition=rendu, sécurité psychologique) |
| 2 | **Architecture Technique Différenciante** | Modules activables, contenus typés, charge technique éliminée, modèle agence |
| 3 | **Séparation Admin Payload / Interface Église** | Deux mondes étanches — le pivot technique qui rend le reste possible |

**Insight :** La priorité #3 est la **fondation** des deux autres. C'est la décision architecturale qui permet l'UX simplifiée et l'architecture différenciante.

### Séquence de Dépendances

```
[Séparation Admin/Interface]
         ↓
[Architecture Technique Différenciante]
         ↓
[Expérience Bénévole Ultra-Simplifiée]
```

---

## Action Planning

### Priorité #3 (Fondation) — Séparation Admin Payload / Interface Église

| # | Action | Livrable |
|---|--------|----------|
| 1 | Définir les frontières exactes Payload vs Interface Église | Document d'architecture avec schéma des deux mondes |
| 2 | Lister les entités Payload (collections, globals) | Schéma de données côté admin |
| 3 | Concevoir l'API/contrat entre les deux mondes | Spécification des endpoints ou data layer |
| 4 | Prototyper l'interface église isolée | Maquette ou POC de l'espace collaborateur |

**Critère de succès :** Un bénévole ne voit JAMAIS l'interface Payload. Un dev ne touche JAMAIS l'interface église en production.

### Priorité #2 — Architecture Technique Différenciante

| # | Action | Livrable |
|---|--------|----------|
| 1 | Inventorier les modules MVP (actif/inactif par tenant) | Liste des modules + matrice d'activation |
| 2 | Définir les contenus typés (pas page/article) | Schéma des types : Prédication, Annonce, Activité, Événement, Culte |
| 3 | Concevoir le système multi-tenant | Architecture technique : isolation des données, config par église |
| 4 | Documenter le modèle agence (onboarding église) | Processus : création site → configuration → remise à l'église |

**Critère de succès :** Chaque église a son espace isolé, avec uniquement les modules dont elle a besoin, sans voir de complexité technique.

### Priorité #1 — Expérience Bénévole Ultra-Simplifiée

| # | Action | Livrable |
|---|--------|----------|
| 1 | Créer le glossaire "Vocabulaire Narthex" | Liste des termes église vs termes techniques interdits |
| 2 | Mapper les parcours utilisateur clés (Marie-Claire) | User flows : Créer annonce, Préparer culte, Ajouter prédication |
| 3 | Appliquer la règle "3 clics max" à chaque parcours | Audit UX de chaque flow |
| 4 | Prototyper l'éditeur "Édition = Rendu" | Maquette/POC de l'expérience d'édition |
| 5 | Définir les zones de "sécurité psychologique" | Ce que le bénévole peut/ne peut pas casser |

**Critère de succès :** Marie-Claire (58 ans, bénévole) publie une annonce en moins de 60 secondes, sans aide, sans stress.

---

## Quick Wins — Actions Immédiates

### Documentation & Clarification (0 code)

| # | Quick Win | Effort | Valeur |
|---|-----------|--------|--------|
| 1 | Glossaire "Vocabulaire Narthex" | 1h | Référence pour toute l'équipe |
| 2 | Schéma des deux mondes (Payload vs Interface Église) | 2h | Visualisation claire de l'architecture |
| 3 | Liste des modules MVP avec statut actif/inactif | 1h | Scope clair du MVP |
| 4 | Fiche persona Marie-Claire | 30min | Référence UX pour chaque décision |

### Conception & Maquettes (0 code)

| # | Quick Win | Effort | Valeur |
|---|-----------|--------|--------|
| 5 | Wireframe "Vue Ce Dimanche" | 2-3h | Concrétise l'objet central |
| 6 | User flow "Créer une annonce" en 3 clics | 1h | Valide la règle UX |
| 7 | Liste des contenus typés avec champs | 2h | Schéma de données prêt pour Payload |

### Technique

| # | Quick Win | Effort | Valeur |
|---|-----------|--------|--------|
| 8 | Scaffolding Payload avec collections de base | 3-4h | Fondation technique en place |
| 9 | Collection "Culte" dans Payload | 2h | L'objet central existe |
| 10 | Collection "Chant" avec structure riche | 2h | Base du répertoire de louange |

### Top 5 Recommandés Cette Semaine

1. **Schéma des deux mondes** — Clarifie l'architecture avant de coder
2. **Liste des modules MVP** — Scope verrouillé = pas de dérive
3. **Liste des contenus typés + champs** — Prêt à implémenter dans Payload
4. **Wireframe "Vue Ce Dimanche"** — Visualise la vision produit
5. **Glossaire vocabulaire** — Référence UX permanente

---

## Session Summary and Insights

### Accomplissements Clés

- **46 éléments structurants** générés (27 fonctionnalités + 10 principes UX + 9 décisions architecturales)
- **5 thèmes cohérents** identifiés pour organiser la vision produit
- **3 priorités stratégiques** validées avec plans d'action concrets
- **10 quick wins** identifiés pour démarrer immédiatement
- **Découverte fondatrice** : le culte du dimanche comme objet central de l'application

### Insights de Facilitation

**Forces créatives de Matthias :**
- Vision produit claire et assumée
- Capacité à délimiter le périmètre (hors périmètre : finances, ministère enfants, suivi pastoral)
- Pragmatisme MVP — prioriser l'essentiel
- Compréhension fine des utilisateurs cibles (bénévoles non-techniques)

**Ce qui a fonctionné :**
- Le Role Playing a révélé les besoins réels par persona
- Le SCAMPER a systématiquement déconstruit WordPress pour innover
- Le Reverse Brainstorming a produit une charte UX solide par inversion
- La séquence des techniques (comprendre → générer → valider) était efficace

### Prochaines Étapes Recommandées

1. Exécuter les 5 quick wins recommandés cette semaine
2. Créer le PRD (Product Requirements Document) à partir de cette session
3. Valider l'architecture technique avec un POC de la séparation Admin/Interface
4. Itérer sur les wireframes avec des retours utilisateurs (Marie-Claire réelle si possible)

---

*Session complétée le 2026-02-05*
*Facilitateur IA : Mary (Business Analyst)*
