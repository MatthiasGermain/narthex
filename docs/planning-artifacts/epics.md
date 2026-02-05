---
status: 'complete'
completedAt: '2026-02-05'
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-validation']
inputDocuments:
  - 'docs/planning-artifacts/prd.md'
  - 'docs/planning-artifacts/architecture.md'
  - 'docs/IDENTITÉ GRAPHIQUE DE SPOTLIGHT.pdf'
workflowType: 'epics'
project_name: 'Narthex'
user_name: 'Matthias'
date: '2026-02-05'
---

# Narthex - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Narthex, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Authentification & Utilisateurs**
- FR1: Un utilisateur peut se connecter avec email et mot de passe
- FR2: Un utilisateur peut se déconnecter
- FR3: Un utilisateur peut réinitialiser son mot de passe
- FR4: Le système restreint l'accès selon le rôle (Super-Admin, Admin Église, Bénévole)
- FR5: Un utilisateur ne peut voir/modifier que les données de son tenant

**Gestion Multi-tenant**
- FR6: Le Super-Admin peut créer un nouveau tenant (église)
- FR7: Le Super-Admin peut configurer le domaine/sous-domaine d'un tenant
- FR8: Le Super-Admin peut personnaliser un tenant (logo, couleurs, nom)
- FR9: Le Super-Admin peut créer des utilisateurs pour un tenant
- FR10: Le système route automatiquement vers le bon tenant selon le domaine

**Gestion des Événements**
- FR11: Un Bénévole peut ajouter un événement au calendrier
- FR12: Un Bénévole peut modifier un événement existant
- FR13: Un Bénévole peut supprimer un événement
- FR14: Un Bénévole peut marquer un événement comme "Public" ou "Interne"
- FR15: Un Bénévole peut spécifier : titre, date, heure, lieu, description
- FR16: Le système affiche une confirmation après ajout/modification

**Dashboard Bénévole**
- FR17: Un Bénévole peut accéder à un dashboard après connexion
- FR18: Le dashboard affiche les actions disponibles (vocabulaire église)
- FR19: Un Bénévole peut accéder au calendrier depuis le dashboard
- FR20: Le dashboard n'affiche que les modules activés pour ce tenant

**Site Public**
- FR21: Un visiteur peut voir le site public de l'église sans connexion
- FR22: Un visiteur peut voir le calendrier des événements publics
- FR23: Un visiteur peut voir les détails d'un événement
- FR24: Un visiteur peut voir les informations de l'église (nom, logo, couleurs)
- FR25: Un visiteur peut accéder à un lien "Espace membre" pour se connecter

**Administration Payload (Super-Admin)**
- FR26: Le Super-Admin peut accéder à l'interface Payload Admin
- FR27: Le Super-Admin peut gérer tous les tenants
- FR28: Le Super-Admin peut gérer tous les utilisateurs
- FR29: Le Super-Admin peut voir/modifier toutes les données

### Non-Functional Requirements

**Performance**
- NFR1: Lighthouse Performance Score (mobile) > 90
- NFR2: Time to Interactive (3G) < 3 secondes
- NFR3: Temps de réponse actions utilisateur < 500ms
- NFR4: Temps d'affichage calendrier < 1 seconde

**Security**
- NFR5: Isolation des données entre tenants — 100%, aucune fuite cross-tenant
- NFR6: Mots de passe hashés avec bcrypt ou argon2
- NFR7: Communication HTTPS obligatoire en production
- NFR8: Protection CSRF avec tokens sur tous les formulaires
- NFR9: Conformité RGPD — politique de confidentialité, droit à l'effacement

**Reliability**
- NFR10: Uptime 99% (≈ 7h downtime/mois max)
- NFR11: Backups base de données quotidiens
- NFR12: Zéro perte de données utilisateur — transactions ACID

**Accessibility**
- NFR13: Contraste texte/fond WCAG AA (4.5:1 minimum)
- NFR14: Navigation clavier fonctionnelle pour les actions principales
- NFR15: Taille de police lisible — 16px minimum pour le corps de texte

### Additional Requirements

**From Architecture — Technical Foundation:**
- Environnement Payload CMS v3.74.0 + Next.js 15.4.11 existant (pas de nouveau starter)
- PostgreSQL via Neon.tech (dev) connecté
- Multi-tenant avec champ `church` (relation Payload)
- RBAC avec enum `role` sur Users (`super-admin`, `admin-church`, `volunteer`)
- REST API uniquement (pas GraphQL pour MVP)
- Shadcn/ui + Tailwind CSS pour le styling
- Coolify auto-deploy (push main → deploy)

**From Architecture — Implementation Patterns:**
- Access Control centralisé dans `/src/access/`
- Composants dans `/components/features/{feature}/`
- Fichiers en kebab-case
- Date et time séparés pour les événements
- Code en anglais, UI en français
- Toast pour feedback, inline pour validation

**From Architecture — Structure:**
- Collection Churches (tenant foundation) à créer
- Collection Events à créer
- Users à étendre (church relation + role)
- Middleware tenant resolution à implémenter
- Route `(frontend)/[domain]` pour multi-tenant

**From Design Reference:**
- Charte graphique Spotlight (église pilote) pour le template initial
- Couleurs et style à adapter par tenant

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Login email/password |
| FR2 | Epic 2 | Logout |
| FR3 | Epic 2 | Reset password |
| FR4 | Epic 2 | RBAC (3 rôles) |
| FR5 | Epic 2 | Isolation tenant |
| FR6 | Epic 1 | Créer tenant |
| FR7 | Epic 1 | Config domaine |
| FR8 | Epic 1 | Personnaliser tenant |
| FR9 | Epic 1 | Créer users |
| FR10 | Epic 1 | Routing domaine |
| FR11 | Epic 3 | Ajouter événement |
| FR12 | Epic 3 | Modifier événement |
| FR13 | Epic 3 | Supprimer événement |
| FR14 | Epic 3 | Public/Interne |
| FR15 | Epic 3 | Champs événement |
| FR16 | Epic 3 | Confirmation |
| FR17 | Epic 3 | Dashboard accès |
| FR18 | Epic 3 | Vocabulaire église |
| FR19 | Epic 3 | Accès calendrier |
| FR20 | Epic 3 | Modules tenant |
| FR21 | Epic 4 | Site public visible |
| FR22 | Epic 4 | Calendrier public |
| FR23 | Epic 4 | Détail événement |
| FR24 | Epic 4 | Infos église |
| FR25 | Epic 4 | Lien espace membre |
| FR26 | Epic 1 | Payload Admin |
| FR27 | Epic 1 | Gérer tenants |
| FR28 | Epic 1 | Gérer users |
| FR29 | Epic 1 | Accès données |

**Couverture : 29/29 FRs (100%)**

## Epic List

### Epic 1: Multi-tenant Foundation
**Goal:** Super-Admin (Matthias) peut créer et configurer la première église (Spotlight)

**User Value:** Créer un tenant complet avec domaine, logo, couleurs via Payload Admin

**FRs couverts:** FR6, FR7, FR8, FR9, FR10, FR26, FR27, FR28, FR29

**Scope:**
- Collection Churches (name, slug, domains, logo, colors, settings)
- Extension Users (church relation + role enum)
- Middleware tenant routing (*.localhost dev, custom domains prod)
- Access Control helpers (/src/access/)
- Payload Admin fonctionnel pour Super-Admin
- Premier tenant créé (Spotlight)

---

### Epic 2: User Authentication
**Goal:** Les utilisateurs peuvent se connecter à leur église

**User Value:** Marie-Claire peut se connecter avec email/password et accéder à son tenant

**FRs couverts:** FR1, FR2, FR3, FR4, FR5

**Scope:**
- Login page (/[domain]/login)
- Logout functionality
- Password reset flow
- RBAC enforcement (super-admin, admin-church, volunteer)
- Tenant isolation (Access Control filtre par church)

---

### Epic 3: Event Management (Core MVP)
**Goal:** Marie-Claire peut ajouter un événement en < 1 minute

**User Value:** Use case MVP validé — bénévole autonome pour gérer le calendrier

**FRs couverts:** FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20

**Scope:**
- Collection Events (title, date, time, location, description, visibility, church)
- Dashboard bénévole (/[domain]/dashboard)
- Event form (create/edit)
- Event list with actions
- Public/Interne toggle
- Delete with confirmation
- Toast feedback ("Événement ajouté ✓")
- Vocabulaire église (pas de jargon technique)

---

### Epic 4: Public Church Site
**Goal:** Amina peut découvrir l'église et voir les événements à venir

**User Value:** Visiteurs voient le site public professionnel avec calendrier

**FRs couverts:** FR21, FR22, FR23, FR24, FR25

**Scope:**
- Homepage église (/[domain])
- Church header (nom, logo, couleurs from tenant config)
- Public event calendar (/[domain]/events)
- Event detail page (/[domain]/events/[id])
- "Espace membre" link to login
- Responsive design (mobile-first)
- Lighthouse > 90

---

## Epic 1: Multi-tenant Foundation

Super-Admin (Matthias) peut créer et configurer la première église (Spotlight).

### Story 1.1: Create Churches Collection

**As a** Super-Admin,
**I want** to define church entities in the system,
**So that** I can create and manage multiple church tenants.

**Acceptance Criteria:**

**Given** I am logged in as Super-Admin in Payload Admin
**When** I navigate to the Churches collection
**Then** I can create a new church with:
- `name` (text, required) — Display name
- `slug` (text, unique, required) — URL identifier
- `domains` (array of text) — Allowed domains
- `logo` (upload, relation to Media)
- `colors` (group: primary, secondary)
- `settings` (group: enabled modules)
**And** the collection has proper indexes on `slug` and `domains`

**Technical Notes:**
- File: `/src/collections/Churches.ts`
- Access: Super-Admin only for all operations
- FRs: FR6, FR7, FR8

---

### Story 1.2: Extend Users with Church & Role

**As a** Super-Admin,
**I want** users to be linked to a specific church with a defined role,
**So that** access can be controlled per tenant.

**Acceptance Criteria:**

**Given** the Churches collection exists
**When** I create or edit a user in Payload Admin
**Then** I can assign:
- `church` (relationship to Churches, required for non-super-admin)
- `role` (select: 'super-admin', 'admin-church', 'volunteer')
**And** Super-Admin users have no church restriction
**And** other users must have a church assigned

**Technical Notes:**
- File: `/src/collections/Users.ts` (extend existing)
- Role enum defined as Payload select field
- FRs: FR9, FR4

---

### Story 1.3: Create Access Control Helpers

**As a** developer,
**I want** centralized access control functions,
**So that** tenant isolation is consistent across all collections.

**Acceptance Criteria:**

**Given** Users have church and role fields
**When** Access Control is evaluated on any collection
**Then** helpers provide:
- `isSuperAdmin(req)` — Returns true if user is super-admin
- `belongsToChurch(req)` — Returns query filter `{ church: { equals: user.church } }`
- `isAdmin(req)` — Returns true if admin-church or super-admin
- `isVolunteer(req)` — Returns true if volunteer or higher
**And** helpers are exported from `/src/access/index.ts`

**Technical Notes:**
- Files: `/src/access/tenant.ts`, `/src/access/roles.ts`, `/src/access/index.ts`
- FRs: FR5, FR26, FR27, FR28, FR29

---

### Story 1.4: Implement Tenant Routing Middleware

**As a** visitor,
**I want** to access a church site via its domain or subdomain,
**So that** I see the correct church content.

**Acceptance Criteria:**

**Given** I access `eglise-demo.localhost:3000` (dev) or `eglise-demo.com` (prod)
**When** the middleware processes the request
**Then** it resolves the tenant from:
- Subdomain of `.localhost` in development
- Query param `?tenant=xxx` as fallback in development
- Custom domain lookup in Churches.domains in production
**And** the tenant context is injected into the request
**And** 404 is returned if no matching tenant is found

**Technical Notes:**
- File: `/src/middleware.ts`
- Uses Payload Local API to query Churches collection
- FRs: FR10

---

### Story 1.5: Setup Tailwind & Shadcn/ui

**As a** developer,
**I want** Tailwind CSS and Shadcn/ui configured,
**So that** I can build accessible UI components quickly.

**Acceptance Criteria:**

**Given** the Next.js project exists
**When** I run the setup
**Then** Tailwind CSS is configured with:
- `tailwind.config.ts` with content paths
- `postcss.config.js`
- `globals.css` with Tailwind directives
**And** Shadcn/ui is initialized with:
- `components.json` configuration
- `/src/components/ui/` directory
- `cn()` utility in `/src/lib/utils.ts`

**Technical Notes:**
- Run: `pnpm add -D tailwindcss postcss autoprefixer`
- Run: `npx shadcn-ui@latest init`
- NFRs: NFR13, NFR14, NFR15 (accessibility foundation)

---

### Story 1.6: Create First Tenant (Spotlight)

**As a** Super-Admin,
**I want** to create the first church tenant for Spotlight,
**So that** development can proceed with real data.

**Acceptance Criteria:**

**Given** Churches collection and middleware exist
**When** I create the Spotlight tenant in Payload Admin
**Then** it has:
- `name`: "Spotlight"
- `slug`: "spotlight"
- `domains`: ["spotlight.localhost"]
- `colors`: (from charte graphique PDF)
**And** I can access `spotlight.localhost:3000` and see it resolves
**And** I can create a test user (volunteer) linked to Spotlight

**Technical Notes:**
- Manual creation via Payload Admin
- Seed script optional for dev environment

---

## Epic 2: User Authentication

Les utilisateurs peuvent se connecter à leur église.

### Story 2.1: Create Login Page

**As a** church member,
**I want** to login with my email and password,
**So that** I can access my church's dashboard.

**Acceptance Criteria:**

**Given** I am on the login page `/[domain]/login`
**When** I enter my email and password and click "Se connecter"
**Then** I am authenticated via Payload Auth
**And** I am redirected to `/[domain]/dashboard`
**And** my session includes my church and role

**Given** I enter invalid credentials
**When** I click "Se connecter"
**Then** I see an error message "Email ou mot de passe incorrect"
**And** I remain on the login page

**Technical Notes:**
- File: `/src/app/(frontend)/[domain]/login/page.tsx`
- Uses Payload REST API `/api/users/login`
- Shadcn/ui form components (Input, Button, Label)
- FRs: FR1

---

### Story 2.2: Implement Logout

**As a** logged-in user,
**I want** to logout from my session,
**So that** my account is secure on shared devices.

**Acceptance Criteria:**

**Given** I am logged in
**When** I click "Déconnexion"
**Then** my session is terminated via Payload Auth
**And** I am redirected to the public homepage `/[domain]`
**And** I can no longer access protected routes

**Technical Notes:**
- Uses Payload REST API `/api/users/logout`
- Button in dashboard header/nav
- FRs: FR2

---

### Story 2.3: Password Reset Flow

**As a** user who forgot my password,
**I want** to reset it via email,
**So that** I can regain access to my account.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I click "Mot de passe oublié ?"
**Then** I see a form to enter my email

**Given** I enter my registered email
**When** I click "Envoyer"
**Then** Payload sends a password reset email
**And** I see "Un email vous a été envoyé"

**Given** I click the reset link in my email
**When** I enter a new password
**Then** my password is updated
**And** I can login with my new password

**Technical Notes:**
- Uses Payload built-in forgot-password/reset-password
- Page: `/[domain]/login/forgot-password`
- Page: `/[domain]/login/reset-password`
- FRs: FR3

---

### Story 2.4: Auth Protected Routes

**As a** system,
**I want** dashboard routes protected by authentication,
**So that** only logged-in users can access them.

**Acceptance Criteria:**

**Given** I am not logged in
**When** I try to access `/[domain]/dashboard`
**Then** I am redirected to `/[domain]/login`
**And** after login, I am redirected back to dashboard

**Given** I am logged in as a user from Church A
**When** I try to access `/church-b/dashboard`
**Then** I see a 403 or am redirected to my own church

**Technical Notes:**
- File: `/src/app/(frontend)/[domain]/dashboard/layout.tsx`
- Server-side auth check using Payload cookies
- FRs: FR4, FR5

---

## Epic 3: Event Management (Core MVP)

Marie-Claire peut ajouter un événement en < 1 minute.

### Story 3.1: Create Events Collection

**As a** developer,
**I want** an Events collection in Payload,
**So that** events can be stored and managed per church.

**Acceptance Criteria:**

**Given** I am in Payload Admin as Super-Admin
**When** I navigate to the Events collection
**Then** I can create an event with:
- `title` (text, required)
- `date` (date, required)
- `time` (text, format HH:mm, required)
- `location` (text)
- `description` (richText or textarea)
- `visibility` (select: 'public', 'internal', default: 'public')
- `church` (relationship to Churches, required)
**And** Access Control restricts events to their church (except Super-Admin)

**Technical Notes:**
- File: `/src/collections/Events.ts`
- Uses Access Control helpers from `/src/access/`
- FRs: FR14, FR15

---

### Story 3.2: Create Dashboard Layout

**As a** logged-in volunteer,
**I want** a dedicated dashboard area,
**So that** I have a clear workspace for my tasks.

**Acceptance Criteria:**

**Given** I am logged in and access `/[domain]/dashboard`
**When** the page loads
**Then** I see:
- A header with church name/logo and my name
- A "Déconnexion" button
- A sidebar or nav with available actions
- Main content area
**And** the design uses Shadcn/ui components
**And** the layout is responsive (mobile-friendly)

**Technical Notes:**
- File: `/src/app/(frontend)/[domain]/dashboard/layout.tsx`
- Components: `/src/components/features/dashboard/`
- FRs: FR17

---

### Story 3.3: Dashboard Home with Quick Actions

**As a** volunteer,
**I want** to see quick actions on my dashboard,
**So that** I can immediately do what I came for.

**Acceptance Criteria:**

**Given** I am on the dashboard home `/[domain]/dashboard`
**When** the page loads
**Then** I see:
- A welcome message with my name
- Quick action buttons: "Ajouter un événement", "Voir le calendrier"
- Optionally: recent events I created
**And** vocabulary is church-friendly (no technical jargon)
**And** only modules enabled for this tenant are shown

**Technical Notes:**
- File: `/src/app/(frontend)/[domain]/dashboard/page.tsx`
- Components: `welcome-card.tsx`, `quick-actions.tsx`
- FRs: FR18, FR19, FR20

---

### Story 3.4: Event Creation Form

**As a** volunteer,
**I want** to add a new event in under 1 minute,
**So that** the church calendar stays up to date.

**Acceptance Criteria:**

**Given** I click "Ajouter un événement" on the dashboard
**When** I fill in the form:
- Titre (required)
- Date (date picker)
- Heure (time input)
- Lieu (optional)
- Description (optional)
- Visibilité (Public/Interne toggle, default Public)
**And** I click "Ajouter"
**Then** the event is created via Payload REST API
**And** I see a Toast: "Événement ajouté ✓"
**And** I am redirected to the event list

**Given** I leave required fields empty
**When** I click "Ajouter"
**Then** I see inline validation errors

**Technical Notes:**
- File: `/src/app/(frontend)/[domain]/dashboard/events/new/page.tsx`
- Component: `/src/components/features/events/event-form.tsx`
- Uses Server Action or REST API POST to `/api/events`
- FRs: FR11, FR15, FR16

---

### Story 3.5: Event List in Dashboard

**As a** volunteer,
**I want** to see all events for my church,
**So that** I can manage them.

**Acceptance Criteria:**

**Given** I am on `/[domain]/dashboard/events`
**When** the page loads
**Then** I see a list of events for my church:
- Title, date, time, visibility badge
- Actions: "Modifier", "Supprimer"
**And** events are sorted by date (upcoming first)
**And** I can filter by visibility (Public/Interne)

**Technical Notes:**
- File: `/src/app/(frontend)/[domain]/dashboard/events/page.tsx`
- Component: `/src/components/features/events/event-list.tsx`
- Fetches via Payload REST API with church filter
- FRs: FR19

---

### Story 3.6: Edit Event

**As a** volunteer,
**I want** to modify an existing event,
**So that** I can correct mistakes or update details.

**Acceptance Criteria:**

**Given** I click "Modifier" on an event
**When** I am on `/[domain]/dashboard/events/[id]/edit`
**Then** I see the event form pre-filled with current values
**And** I can update any field
**And** I click "Enregistrer"
**Then** the event is updated via Payload REST API
**And** I see a Toast: "Événement modifié ✓"
**And** I am redirected to the event list

**Technical Notes:**
- File: `/src/app/(frontend)/[domain]/dashboard/events/[id]/edit/page.tsx`
- Reuses `event-form.tsx` component in edit mode
- FRs: FR12, FR16

---

### Story 3.7: Delete Event with Confirmation

**As a** volunteer,
**I want** to delete an event with confirmation,
**So that** I don't accidentally remove important events.

**Acceptance Criteria:**

**Given** I click "Supprimer" on an event
**When** a confirmation dialog appears: "Supprimer cet événement ?"
**And** I click "Confirmer"
**Then** the event is deleted via Payload REST API
**And** I see a Toast: "Événement supprimé"
**And** the event list refreshes

**Given** I click "Annuler" in the dialog
**Then** the event is not deleted
**And** the dialog closes

**Technical Notes:**
- Uses Shadcn/ui Dialog component
- FRs: FR13

---

## Epic 4: Public Church Site

Amina peut découvrir l'église et voir les événements à venir.

### Story 4.1: Public Homepage

**As a** visitor,
**I want** to see the church's homepage,
**So that** I can learn about the church.

**Acceptance Criteria:**

**Given** I access `spotlight.localhost:3000` (or custom domain)
**When** the page loads
**Then** I see:
- Church name and logo
- A welcoming hero section
- Quick info (address, service times if configured)
- Link to events calendar
- Link to "Espace membre"
**And** the page loads in < 3 seconds on 3G
**And** the design uses the church's colors

**Technical Notes:**
- File: `/src/app/(frontend)/[domain]/page.tsx`
- Uses ISR for performance
- FRs: FR21, FR24

---

### Story 4.2: Church Header Component

**As a** visitor,
**I want** to see the church's branding on every page,
**So that** I know which church site I'm on.

**Acceptance Criteria:**

**Given** I am on any public page
**When** the page loads
**Then** I see a header with:
- Church logo (from tenant config)
- Church name
- Navigation links (Accueil, Événements, Espace membre)
**And** the header uses the tenant's color scheme
**And** the header is responsive (hamburger menu on mobile)

**Technical Notes:**
- Component: `/src/components/layout/header.tsx`
- Component: `/src/components/features/churches/church-header.tsx`
- Fetches church data from tenant context
- FRs: FR24

---

### Story 4.3: Public Events Calendar

**As a** visitor,
**I want** to see upcoming public events,
**So that** I can plan to attend.

**Acceptance Criteria:**

**Given** I am on `/[domain]/events`
**When** the page loads
**Then** I see a list of PUBLIC events (not internal):
- Event title
- Date and time
- Location
- Brief description preview
**And** events are sorted by date (soonest first)
**And** past events are hidden or in a separate section
**And** I can click on an event to see details

**Technical Notes:**
- File: `/src/app/(frontend)/[domain]/events/page.tsx`
- Component: `/src/components/features/events/event-list.tsx` (public variant)
- Filters: `{ visibility: { equals: 'public' }, church: { equals: tenantId } }`
- FRs: FR22

---

### Story 4.4: Event Detail Page

**As a** visitor,
**I want** to see full details of an event,
**So that** I have all the information I need to attend.

**Acceptance Criteria:**

**Given** I click on an event from the calendar
**When** I am on `/[domain]/events/[id]`
**Then** I see:
- Event title (large)
- Date and time (formatted nicely: "Samedi 20 décembre à 20h")
- Location with optional map link
- Full description
- Back link to calendar
**And** if the event is internal and I'm not logged in, I see 404

**Technical Notes:**
- File: `/src/app/(frontend)/[domain]/events/[id]/page.tsx`
- Component: `/src/components/features/events/event-card.tsx` (detail variant)
- FRs: FR23

---

### Story 4.5: Member Area Link

**As a** visitor,
**I want** to find the login page easily,
**So that** I can access member features if I have an account.

**Acceptance Criteria:**

**Given** I am on any public page
**When** I look at the header/navigation
**Then** I see an "Espace membre" link
**And** clicking it takes me to `/[domain]/login`

**Given** I am already logged in
**When** I see the header
**Then** "Espace membre" is replaced by "Mon espace" linking to dashboard

**Technical Notes:**
- Conditional rendering in header based on auth state
- FRs: FR25

---

### Story 4.6: Performance Optimization

**As a** visitor on a slow connection,
**I want** the site to load quickly,
**So that** I don't give up waiting.

**Acceptance Criteria:**

**Given** the public site is deployed
**When** I run Lighthouse audit on mobile
**Then** Performance score is > 90
**And** Time to Interactive is < 3 seconds on 3G
**And** images are optimized (WebP, lazy loading)
**And** CSS is minimal (Tailwind purge)

**Technical Notes:**
- Use Next.js Image component
- Enable ISR with appropriate revalidation
- Minimize client-side JavaScript
- NFRs: NFR1, NFR2, NFR3, NFR4
