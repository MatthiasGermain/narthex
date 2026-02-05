---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
workflow_completed: true
completion_date: '2026-02-05'
inputDocuments:
  - 'docs/brainstorming/brainstorming-session-2026-02-04.md'
  - 'inline: Initial Technical Vision (Next.js 15, Payload CMS v3, PostgreSQL, Multi-tenant)'
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 0
  technicalNotes: 1
classification:
  projectType: 'SaaS Multi-tenant (Factory)'
  domain: 'Religious / Non-profit'
  complexity: 'Medium'
  projectContext: 'Greenfield'
---

# Product Requirements Document - Narthex

**Author:** Matthias
**Date:** 2026-02-05

## Executive Summary

**Product:** Narthex — Plateforme SaaS multi-tenant pour sites d'églises

**Vision:** Remplacer WordPress pour les églises francophones avec une interface ultra-simple que les bénévoles non-techniques peuvent utiliser seuls.

**Différenciateur:** L'UX "anti-WordPress" — Marie-Claire (58 ans, bénévole) ajoute un événement en moins d'1 minute, sans aide, sans stress.

**Cible:** Églises protestantes francophones, via modèle agence (installation + abonnement).

**Hypothèse à valider:** "Une interface pensée pour les bénévoles leur permet de maintenir leur site seuls."

**MVP:** Site public + calendrier + ajout événement + multi-tenant — Timeline 6 mois, solo dev.

## Success Criteria

### User Success

| Critère | Cible |
|---------|-------|
| Marie-Claire ajoute un événement | < 1 minute, seule, sans aide |
| Zéro jargon technique | 100% vocabulaire église ("Annonce", "Prédication", pas "Post", "Slug") |
| Pas de peur de casser | Actions réversibles, périmètre limité |
| Édition = Rendu | Zéro surprise entre ce qu'on écrit et ce qu'on voit |

### Business Success

| Critère | Cible MVP |
|---------|-----------|
| Premier client payant | 1 église qui paye l'installation |
| Timeline | 6 mois après début dev |
| Validation hypothèse | Marie-Claire d'une vraie église teste et valide l'UX |

### Technical Success

| Critère | Cible MVP |
|---------|-----------|
| Performance | Lighthouse > 90 (mobile) |
| Time to Interactive | < 3 secondes (3G) |
| Uptime | 99% (≈ 7h downtime/mois max) |
| Zéro bug bloquant | Le use case MVP doit toujours fonctionner |

### Measurable Outcomes

- **Validation MVP** : Un bénévole d'église ajoute un événement en < 1 minute lors d'un test utilisateur
- **Business MVP** : Une église paye pour l'installation et utilise le produit
- **Technical MVP** : Score Lighthouse > 90, aucun bug bloquant sur le use case principal

## Product Scope

### MVP - Minimum Viable Product

Valide l'hypothèse : "Une interface pensée pour les bénévoles leur permet de maintenir leur site seuls"

- Site public avec template unique + personnalisation minimale (logo, couleurs, nom)
- Calendrier d'événements public
- Interface d'ajout d'événement ultra-simple (< 1 minute)
- Authentification simple pour bénévole
- 1 église pilote

### Growth Features (Post-MVP)

- Multi-tenant complet (plusieurs églises)
- Culte comme objet riche (planning, responsables, chants)
- Répertoire de louange avec set-lists
- Templates de design multiples
- Modules activables/désactivables par tenant

### Vision (Future)

- Les 27 fonctionnalités du brainstorming
- Diffusion/Projection web des chants
- Intégrations externes (Mailchimp, réseaux sociaux)
- Scraping intelligent de chants

## User Journeys

### Journey 1 : Marie-Claire — Ajouter un événement

**Persona :** Marie-Claire, 58 ans, secrétaire bénévole, pas technique mais motivée.

**Opening Scene :**
Dimanche après le culte. Le pasteur lui dit : "Marie-Claire, tu peux mettre le concert de Noël sur le site ?" Elle rentre chez elle, ouvre son ordinateur.

**Rising Action :**
1. Elle va sur `eglise-tiers.com`
2. Elle clique sur "Espace membre" → formulaire de connexion simple
3. Elle arrive sur son **dashboard** — interface épurée, pas de jargon
4. Elle voit "Calendrier" ou "Ajouter un événement" — elle clique
5. Elle sélectionne le **20 décembre**, remplit : titre, heure, lieu
6. Elle choisit **"Public"** (visible sur le site) ou "Interne" (membres seulement)
7. Elle clique **"Ajouter"**

**Climax :**
Un message de confirmation apparaît : **"Concert de Noël ajouté ✓"**
Elle voit l'événement dans le calendrier. Pas de doute, c'est fait.

**Resolution :**
Elle ferme l'ordinateur, rassurée. Pas de stress, pas de "est-ce que j'ai cassé quelque chose ?". Le lendemain, elle vérifie sur le site public : l'événement est là.

**Temps total : < 1 minute.**

### Journey 2 : Amina — Découvrir l'église

**Persona :** Amina, 33 ans, nouvelle dans la ville, cherche une église protestante.

**Opening Scene :**
Amina tape "église protestante Belleville" sur Google. Elle trouve `eglise-tiers.com` dans les résultats.

**Rising Action :**
1. Elle clique → le site s'affiche **instantanément** (< 3s)
2. Elle voit : nom de l'église, photo accueillante, horaires du culte
3. Elle cherche "Quand est le prochain événement ?" → **Calendrier public**
4. Elle voit le **Concert de Noël — 20 décembre 20h** (ajouté par Marie-Claire)
5. Elle clique pour voir les détails : lieu, description

**Climax :**
Elle se dit : "Cette église a l'air vivante et accueillante." Elle note la date dans son agenda.

**Resolution :**
Le 20 décembre, elle vient au concert. Elle rencontre des gens. Elle revient au culte suivant.

### Journey 3 : Matthias (Agence) — Créer le site d'une église

**Persona :** Matthias — dev, créateur de sites pour églises.

**Opening Scene :**
Une nouvelle église te contacte : "On veut un site moderne, notre WordPress est mort."

**Rising Action :**
1. Création d'un nouveau tenant dans Payload Admin
2. Configuration : nom, domaine `nouvelle-eglise.com`, logo, couleurs
3. Activation des modules nécessaires (calendrier, prédications, etc.)
4. Personnalisation du template si besoin
5. Création d'un compte "bénévole" pour Marie-Claire

**Climax :**
Envoi des accès à l'église : "Votre site est prêt. Voici comment ajouter un événement."

**Resolution :**
L'église paye l'installation. Marie-Claire prend la main. Passage au client suivant.

### Journey Requirements Summary

| Journey | Capacités requises |
|---------|-------------------|
| Marie-Claire | Auth simple, Dashboard bénévole, Calendrier, Ajout événement, Feedback visuel, Choix public/interne |
| Amina | Site public rapide, Calendrier public, Pages d'info (horaires, accès), SEO de base |
| Matthias | Admin Payload, Création tenant, Config domaine, Gestion modules, Création users |

## SaaS Multi-tenant Specific Requirements

### Project-Type Overview

Narthex est une plateforme SaaS Multi-tenant "Factory" :
- **Un codebase** pour toutes les églises
- **Une base de données** avec isolation par `church_id`
- **Routing dynamique** par domaine/sous-domaine

### Technical Architecture Considerations

#### Multi-Tenant Model

| Aspect | Implémentation |
|--------|----------------|
| Isolation | Données filtrées par `church_id` via Access Control Payload |
| Routing | Middleware Next.js détecte le domaine → `app/(app)/[domain]` |
| Personnalisation | Logo, couleurs, nom par tenant (stockés en DB) |
| Base de données | PostgreSQL partagée (Neon.tech en dev) |

#### RBAC Matrix (Permissions)

| Rôle | Scope | Permissions MVP |
|------|-------|-----------------|
| **Super-Admin (Agence)** | Global | Créer/gérer tenants, accès Payload Admin, tous les droits |
| **Admin Église** | Tenant | Gérer les bénévoles, configurer le site, tous les contenus |
| **Bénévole Éditeur** | Tenant | Ajouter/modifier événements, annonces (périmètre limité) |

#### Subscription Model (MVP)

| Aspect | MVP |
|--------|-----|
| Tiers | **Unique** — pas de formules multiples |
| Pricing | Installation (one-time) + Abonnement (mensuel) |
| Billing | **Externe (via agence)** — pas de système de paiement dans Narthex |

#### Integration List (MVP)

| Catégorie | MVP | Post-MVP |
|-----------|-----|----------|
| Emailing | Aucune | Mailchimp |
| Paiement | Externe (agence) | Externe (agence) |
| Réseaux sociaux | Aucune | Publication multicanal |
| Analytics | Aucune | Plausible/Umami |

### Implementation Considerations

#### Stack Technique Validée

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15+ (App Router) |
| CMS | Payload CMS v3 (intégré Next.js, Code-First) |
| Database | PostgreSQL (Neon.tech dev, VPS prod) |
| Storage | Cloudflare R2 (S3 compatible) |
| Hosting | VPS (OVH/Hetzner) + Coolify |

#### Structure Repo Cible

```
/src
  /app
    /(app)/[domain]   # Front-end dynamique par tenant
    /(payload)        # Admin UI (Super-Admin uniquement)
  /collections        # Schémas Payload (Churches, Events, Users)
  /access             # Logique de sécurité Multi-tenant
  /components         # Composants UI (Templates & Blocks)
  /middleware.ts      # Détection de domaine
```

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**Type :** Problem-Solving MVP
**Objectif :** Prouver que les bénévoles peuvent maintenir leur site seuls

**Décision architecturale :** Multi-tenant dès le MVP pour éviter la dette technique

**Ressources :** Solo dev (Matthias)
**Timeline cible :** 6 mois

### MVP Feature Set (Phase 1)

**Core User Journey :** Marie-Claire ajoute un événement en < 1 minute

**Must-Have Capabilities :**

| Capability | Justification |
|------------|---------------|
| Site public avec template | Amina doit voir l'église |
| Personnalisation minimale (logo, couleurs, nom) | Chaque église a son identité |
| Calendrier d'événements public | Le use case principal |
| Interface d'ajout d'événement | Le test de l'hypothèse |
| Auth simple (login/password) | Marie-Claire doit se connecter |
| Dashboard bénévole épuré | Point d'entrée après login |
| Feedback visuel (confirmation) | Rassurer Marie-Claire |
| Architecture multi-tenant | Fondation pour la suite |
| Admin Payload (Super-Admin) | Matthias crée les tenants |
| 3 rôles RBAC | Super-Admin, Admin église, Bénévole |

### Post-MVP Features

**Phase 2 (Growth) :**
- Plusieurs églises clientes (exploitation du multi-tenant)
- Culte comme objet riche (planning, responsables)
- Répertoire de louange avec set-lists
- Templates de design multiples
- Modules activables/désactivables

**Phase 3 (Vision) :**
- Les 27 fonctionnalités du brainstorming
- Diffusion/Projection web des chants
- Intégrations externes (Mailchimp, réseaux sociaux)
- Scraping intelligent de chants

### Risk Mitigation Strategy

| Type | Risque | Mitigation |
|------|--------|------------|
| **Technique** | Multi-tenant complexe | Architecture prévue dès le départ, isolation par church_id |
| **Marché** | Pas de demande | Consultation d'églises avant dev, prototype Figma pour validation |
| **UX** | Marie-Claire n'y arrive pas | Test utilisateur avec vraie bénévole avant lancement |
| **Ressource** | Solo dev, temps limité | Scope MVP ultra-lean, aucune feature "nice-to-have" |

## Functional Requirements

### Authentification & Utilisateurs

- **FR1:** Un utilisateur peut se connecter avec email et mot de passe
- **FR2:** Un utilisateur peut se déconnecter
- **FR3:** Un utilisateur peut réinitialiser son mot de passe
- **FR4:** Le système restreint l'accès selon le rôle (Super-Admin, Admin Église, Bénévole)
- **FR5:** Un utilisateur ne peut voir/modifier que les données de son tenant

### Gestion Multi-tenant

- **FR6:** Le Super-Admin peut créer un nouveau tenant (église)
- **FR7:** Le Super-Admin peut configurer le domaine/sous-domaine d'un tenant
- **FR8:** Le Super-Admin peut personnaliser un tenant (logo, couleurs, nom)
- **FR9:** Le Super-Admin peut créer des utilisateurs pour un tenant
- **FR10:** Le système route automatiquement vers le bon tenant selon le domaine

### Gestion des Événements

- **FR11:** Un Bénévole peut ajouter un événement au calendrier
- **FR12:** Un Bénévole peut modifier un événement existant
- **FR13:** Un Bénévole peut supprimer un événement
- **FR14:** Un Bénévole peut marquer un événement comme "Public" ou "Interne"
- **FR15:** Un Bénévole peut spécifier : titre, date, heure, lieu, description
- **FR16:** Le système affiche une confirmation après ajout/modification

### Dashboard Bénévole

- **FR17:** Un Bénévole peut accéder à un dashboard après connexion
- **FR18:** Le dashboard affiche les actions disponibles (vocabulaire église)
- **FR19:** Un Bénévole peut accéder au calendrier depuis le dashboard
- **FR20:** Le dashboard n'affiche que les modules activés pour ce tenant

### Site Public

- **FR21:** Un visiteur peut voir le site public de l'église sans connexion
- **FR22:** Un visiteur peut voir le calendrier des événements publics
- **FR23:** Un visiteur peut voir les détails d'un événement
- **FR24:** Un visiteur peut voir les informations de l'église (nom, logo, couleurs)
- **FR25:** Un visiteur peut accéder à un lien "Espace membre" pour se connecter

### Administration Payload (Super-Admin)

- **FR26:** Le Super-Admin peut accéder à l'interface Payload Admin
- **FR27:** Le Super-Admin peut gérer tous les tenants
- **FR28:** Le Super-Admin peut gérer tous les utilisateurs
- **FR29:** Le Super-Admin peut voir/modifier toutes les données

## Non-Functional Requirements

### Performance

- **NFR1:** Lighthouse Performance Score (mobile) > 90
- **NFR2:** Time to Interactive (3G) < 3 secondes
- **NFR3:** Temps de réponse actions utilisateur < 500ms
- **NFR4:** Temps d'affichage calendrier < 1 seconde

### Security

- **NFR5:** Isolation des données entre tenants — 100%, aucune fuite cross-tenant
- **NFR6:** Mots de passe hashés avec bcrypt ou argon2
- **NFR7:** Communication HTTPS obligatoire en production
- **NFR8:** Protection CSRF avec tokens sur tous les formulaires
- **NFR9:** Conformité RGPD — politique de confidentialité, droit à l'effacement

### Reliability

- **NFR10:** Uptime 99% (≈ 7h downtime/mois max)
- **NFR11:** Backups base de données quotidiens
- **NFR12:** Zéro perte de données utilisateur — transactions ACID

### Accessibility

- **NFR13:** Contraste texte/fond WCAG AA (4.5:1 minimum)
- **NFR14:** Navigation clavier fonctionnelle pour les actions principales
- **NFR15:** Taille de police lisible — 16px minimum pour le corps de texte

