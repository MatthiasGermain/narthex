---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
inputDocuments:
  - 'docs/planning-artifacts/prd.md'
  - 'docs/brainstorming/brainstorming-session-2026-02-04.md'
workflowType: 'architecture'
project_name: 'Narthex'
user_name: 'Matthias'
date: '2026-02-05'
status: 'complete'
completedAt: '2026-02-05'
---

# Architecture Decision Document — Narthex

_Ce document se construit collaborativement étape par étape. Les sections sont ajoutées au fur et à mesure de nos décisions architecturales._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
29 FRs réparties en 5 domaines :
- **Authentification (FR1-5)** : Login email/password, logout, password reset, contrôle d'accès RBAC, isolation tenant
- **Multi-tenant (FR6-10)** : Création tenant, configuration domaine, personnalisation (logo/couleurs/nom), gestion users, routing automatique
- **Événements (FR11-16)** : CRUD événements, visibilité public/interne, champs (titre, date, heure, lieu, description), feedback confirmation
- **Dashboard (FR17-20)** : Interface post-login, vocabulaire église, accès calendrier, modules conditionnels
- **Site Public (FR21-25)** : Accès sans login, calendrier public, détails événements, infos église, lien espace membre
- **Admin Payload (FR26-29)** : Interface Super-Admin, gestion globale tenants/users/données

**Non-Functional Requirements:**
- **Performance (NFR1-4)** : Lighthouse > 90, TTI < 3s (3G), réponse < 500ms, calendrier < 1s
- **Sécurité (NFR5-9)** : Isolation 100% cross-tenant, bcrypt/argon2, HTTPS, CSRF, RGPD
- **Fiabilité (NFR10-12)** : 99% uptime, backups quotidiens, ACID
- **Accessibilité (NFR13-15)** : WCAG AA contraste, navigation clavier, police 16px min

**Scale & Complexity:**
- Primary domain: Full-stack Web SaaS
- Complexity level: Medium
- Estimated architectural components: ~8-10 (Auth, Tenant routing, Events, Dashboard, Public site, Admin, Storage, Database)

### Technical Constraints & Dependencies

| Contrainte | Source | Impact |
|------------|--------|--------|
| Next.js 15+ App Router | Décision technique | Structure de routing, middleware, RSC |
| Payload CMS v3 intégré | Décision technique | Collections code-first, Access Control, Auth native |
| PostgreSQL | Décision technique | Schéma relationnel, transactions ACID |
| Cloudflare R2 | Décision technique | Storage S3-compatible pour médias |
| VPS + Coolify | Décision infra | Self-hosted, gestion certificats wildcard |
| Domaines personnalisés | PRD FR7 | Wildcard SSL, configuration DNS par tenant |

### Local Development Strategy

**Problème** : Comment tester le routing multi-tenant sans vrais domaines ?

**Solution retenue** : Sous-domaines `.localhost` + Override dev

| Méthode | Usage | Exemple |
|---------|-------|---------|
| Sous-domaines `.localhost` | Test routing réel | `http://eglise-demo.localhost:3000` |
| Query param `?tenant=xxx` | Debug rapide | `http://localhost:3000?tenant=eglise-demo` |

**Implémentation middleware :**
- En prod : Résolution domaine → tenant via DB
- En dev (`NODE_ENV=development`) :
  - Accepte `*.localhost` comme domaines valides
  - Fallback sur query param `?tenant=` si présent

**Avantages :**
- ✅ Zéro configuration système requise (pas de fichier hosts)
- ✅ Test du vrai comportement multi-tenant
- ✅ Basculement rapide entre tenants
- ✅ Code identique dev/prod

### Cross-Cutting Concerns Identified

1. **Tenant Isolation** — Chaque requête doit filtrer par `church_id`, Access Control sur toutes les collections
2. **Authentication Context** — Session utilisateur doit inclure tenant, rôle, permissions
3. **Domain Resolution** — Middleware doit résoudre domaine → tenant avant chaque requête
4. **Caching Strategy** — ISR avec revalidation on-demand, invalidation par tenant
5. **Error Handling** — Messages en français, vocabulaire église, zéro jargon technique
6. **Audit & Logging** — Traçabilité des actions pour conformité RGPD

## Starter Template Evaluation

### Primary Technology Domain

Full-stack Web SaaS — Environnement Payload CMS v3 + Next.js existant

### Existing Environment Analysis

**Environnement déjà configuré** via `create-payload-app` (blank template) :

| Composant | Version | Notes |
|-----------|---------|-------|
| Payload CMS | 3.74.0 | Intégré Next.js, Lexical editor |
| Next.js | 15.4.11 | App Router, Route groups |
| React | 19.2.1 | Server Components ready |
| PostgreSQL | Neon.tech | Adapter @payloadcms/db-postgres |
| TypeScript | 5.7.3 | Strict mode |
| Testing | Vitest 3.2.3 + Playwright 1.56.1 | Int + E2E |
| Package Manager | pnpm | Monorepo ready |

### Architectural Decisions Already Made

**Language & Runtime:**
- TypeScript strict avec ESM modules
- Node.js ≥20.9.0

**Project Structure:**
- Route groups : `(frontend)` pour site public, `(payload)` pour admin
- Collections code-first dans `/src/collections`
- Config centralisée dans `payload.config.ts`

**Development Experience:**
- Hot reload via `next dev`
- Types auto-générés via `payload generate:types`
- Scripts npm standardisés (build, dev, test, lint)

**Testing Infrastructure:**
- Vitest pour tests d'intégration
- Playwright pour tests E2E
- Helpers existants : `login.ts`, `seedUser.ts`

### Foundation vs. MVP Gap

| Établi | À construire |
|--------|--------------|
| Auth basique (Users) | RBAC 3 rôles + tenant isolation |
| Collections Users, Media | Churches, Events |
| Route groups séparés | Middleware multi-tenant `[domain]` |
| PostgreSQL connecté | Schéma avec `church_id` foreign key |
| Lexical editor | — (suffisant pour MVP) |

**Note:** L'environnement existant est une base solide. Pas besoin de starter supplémentaire — extension de l'existant.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Multi-tenant data model avec relation `church`
- RBAC avec enum `role` sur Users
- REST API pour le frontend

**Important Decisions (Shape Architecture):**
- Structure collection Churches (name, slug, domains, logo, colors, settings)
- Shadcn/ui + Tailwind pour le styling
- Coolify auto-deploy

**Deferred Decisions (Post-MVP):**
- GraphQL (si besoin de requêtes complexes)
- Collection Roles séparée (si granularité fine requise)
- GitHub Actions pipeline (si tests pre-deploy requis)

### Data Architecture

| Décision | Choix | Rationale |
|----------|-------|-----------|
| Modèle multi-tenant | Champ `church` (relation) | Types auto-générés, requêtes optimisées Payload |
| Collection Churches | name, slug, domains, logo, colors, settings | Couvre MVP, évolutif |
| Collection Events | title, date, time, location, description, visibility, church | Use case principal Marie-Claire |

**Schéma relationnel :**
```
Churches (tenant)
  ├── Users (via church relation + role enum)
  ├── Events (via church relation)
  └── Media (via church relation)
```

### Authentication & Security

| Décision | Choix | Rationale |
|----------|-------|-----------|
| Auth method | Payload Auth native | HTTP-only cookies, intégré, sécurisé |
| RBAC | Enum `role` sur Users | Simple, suffisant MVP, Access Control codé |
| Tenant isolation | Access Control functions | Filtre `church` sur chaque requête |

**Rôles définis :**
- `super-admin` : Accès global, Payload Admin
- `admin-church` : Gestion complète du tenant
- `volunteer` : Ajout/modification événements uniquement

**Pattern Access Control :**
```typescript
access: {
  read: ({ req }) => {
    if (req.user?.role === 'super-admin') return true
    return { church: { equals: req.user?.church } }
  }
}
```

### API & Communication Patterns

| Décision | Choix | Rationale |
|----------|-------|-----------|
| API style | REST | Simple, auto-généré par Payload, suffisant MVP |
| Endpoints | `/api/events`, `/api/churches`, etc. | Convention Payload |
| Revalidation | ISR on-demand | `revalidatePath()` après mutation |

### Frontend Architecture

| Décision | Choix | Rationale |
|----------|-------|-----------|
| Styling | Shadcn/ui + Tailwind CSS | Composants accessibles, rapide à prototyper |
| State management | React Server Components + minimal client state | Next.js 15 natif |
| Components | Shadcn/ui (Button, Form, Calendar, Dialog) | WCAG ready, personnalisables |

### Infrastructure & Deployment

| Décision | Choix | Rationale |
|----------|-------|-----------|
| Hosting | VPS + Coolify | Self-hosted, contrôle total |
| CI/CD | Coolify auto-deploy | Push main → deploy automatique |
| SSL | Wildcard via Coolify/Caddy | Domaines custom supportés |
| Database | Neon.tech (dev) → PostgreSQL VPS (prod) | Serverless dev, dédié prod |

### Decision Impact Analysis

**Implementation Sequence:**
1. Collection Churches (tenant foundation)
2. Extension Users (church relation + role)
3. Collection Events (core MVP feature)
4. Middleware tenant resolution
5. Access Control sur toutes les collections
6. Frontend avec Shadcn/ui
7. Déploiement Coolify

**Cross-Component Dependencies:**
- Middleware dépend de Churches (résolution slug/domain)
- Toutes les collections dépendent de Churches (relation tenant)
- Frontend dépend de l'API REST (data fetching)
- Access Control dépend de Users.role + Users.church

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Fichiers & Composants :**
| Type | Convention | Exemple |
|------|------------|---------|
| Composants React | kebab-case | `event-card.tsx` |
| Collections Payload | kebab-case (slug) | `churches`, `events` |
| Fonctions/Variables | camelCase | `getChurchBySlug()` |
| Types/Interfaces | PascalCase | `Church`, `Event` |
| Fichiers utilitaires | kebab-case | `tenant-helpers.ts` |

**Payload Collections :**
- Slug : kebab-case pluriel (`users`, `churches`, `events`)
- Champs : camelCase (`churchId`, `createdAt`)
- Relations : nom de la collection cible (`church`, `user`)

### Structure Patterns

**Organisation des dossiers :**
```
/src
  /access              # Helpers Access Control centralisés
    tenant.ts          # belongsToChurch(), isSuperAdmin()
    roles.ts           # isAdmin(), isVolunteer()
  /app
    /(frontend)/[domain]  # Site public multi-tenant
    /(payload)/           # Admin Payload
  /collections         # Définitions Payload
    Churches.ts
    Events.ts
    Users.ts
    Media.ts
  /components
    /ui                # Shadcn (ne pas modifier)
    /features
      /events          # EventCard, EventForm, EventList
      /churches        # ChurchHeader, ChurchSettings
      /dashboard       # DashboardNav, QuickActions
    /layout            # Header, Footer, Sidebar
  /lib                 # Utilitaires généraux
    utils.ts           # cn(), formatDate()
  /middleware.ts       # Résolution tenant
```

**Tests :**
- `/tests/int/` — Tests d'intégration (Vitest)
- `/tests/e2e/` — Tests end-to-end (Playwright)
- Co-location évitée pour clarté

### Format Patterns

**Dates & Heures (Events) :**
| Champ | Type Payload | Format | Exemple |
|-------|--------------|--------|---------|
| `date` | `date` | ISO date | `2026-12-20` |
| `time` | `text` | HH:mm | `20:00` |

Rationale : Marie-Claire pense "20 décembre à 20h", pas en timestamp.

**API Responses :**
- Payload gère les formats standards
- Succès : `{ docs: [...], totalDocs, page, ... }`
- Erreur : `{ errors: [{ message, field }] }`

**JSON Fields :**
- camelCase pour cohérence JavaScript
- Dates en ISO string dans les réponses API

### Communication Patterns

**Tenant Context :**
- Middleware injecte `tenant` dans les headers/cookies
- Toute requête API inclut le contexte tenant
- Access Control filtre automatiquement par `church`

**Revalidation :**
```typescript
// Après mutation (création/update/delete)
revalidatePath(`/${tenant}/events`)
revalidateTag(`events-${churchId}`)
```

### Process Patterns

**Error Handling :**
| Type d'erreur | Affichage | Exemple |
|---------------|-----------|---------|
| Validation | Inline sous le champ | "Ce champ est requis" |
| Succès | Toast | "Événement ajouté ✓" |
| Erreur réseau | Toast | "Connexion perdue, réessayez" |
| Erreur serveur | Toast + log | "Une erreur est survenue" |

**Loading States :**
- Bouton submit : `disabled` + spinner pendant l'envoi
- Listes : Skeleton loader (Shadcn)
- Pages : `loading.tsx` Next.js

**Langue :**
| Contexte | Langue | Exemple |
|----------|--------|---------|
| Code (logs, comments) | Anglais | `// Fetch church data` |
| UI (messages user) | Français | `"Événement ajouté ✓"` |
| Noms techniques | Anglais | `Events`, `Churches` |

### Enforcement Guidelines

**Tous les agents IA DOIVENT :**
1. Utiliser les helpers `/src/access/` pour l'Access Control (jamais inline)
2. Placer les composants dans `/components/features/{feature}/`
3. Nommer les fichiers en kebab-case
4. Séparer date et time pour les événements
5. Écrire le code en anglais, l'UI en français
6. Utiliser Toast pour feedback, inline pour validation

**Anti-patterns à éviter :**
- ❌ Access Control dupliqué dans chaque collection
- ❌ Composants à la racine de `/components/`
- ❌ Dates en timestamp Unix
- ❌ Messages UI en anglais
- ❌ `console.log` en production (utiliser un logger)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
narthex/
├── .env                          # Variables locales (ignoré git)
├── .env.example                  # Template variables d'environnement
├── .eslintrc.cjs                 # Config ESLint
├── .gitignore
├── .prettierrc.json              # Config Prettier (existant)
├── .vscode/                      # Config VS Code (existant)
├── next.config.mjs               # Config Next.js
├── package.json                  # Dépendances (existant)
├── playwright.config.ts          # Config E2E (existant)
├── postcss.config.js             # Config PostCSS (Tailwind)
├── tailwind.config.ts            # Config Tailwind
├── tsconfig.json                 # Config TypeScript (existant)
├── vitest.config.mts             # Config tests int (existant)
├── components.json               # Config Shadcn/ui
│
├── docs/                         # Documentation projet
│   ├── planning-artifacts/       # PRD, Architecture
│   └── brainstorming/            # Sessions brainstorming
│
├── public/                       # Assets statiques
│   ├── fonts/
│   └── images/
│
├── src/
│   ├── payload.config.ts         # Config Payload principale
│   ├── payload-types.ts          # Types auto-générés (existant)
│   ├── middleware.ts             # Résolution tenant multi-domaine
│   │
│   ├── access/                   # Helpers Access Control
│   │   ├── index.ts              # Export centralisé
│   │   ├── tenant.ts             # belongsToChurch(), filterByTenant()
│   │   └── roles.ts              # isSuperAdmin(), isAdmin(), isVolunteer()
│   │
│   ├── collections/              # Définitions Payload
│   │   ├── index.ts              # Export toutes collections
│   │   ├── Churches.ts           # Tenant principal
│   │   ├── Events.ts             # Événements
│   │   ├── Users.ts              # Utilisateurs + rôles (existant, à étendre)
│   │   └── Media.ts              # Médias (existant)
│   │
│   ├── app/
│   │   ├── globals.css           # Styles globaux + Tailwind
│   │   │
│   │   ├── (payload)/            # Admin Payload (existant)
│   │   │   ├── admin/[[...segments]]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── not-found.tsx
│   │   │   ├── api/[...slug]/route.ts
│   │   │   ├── api/graphql/route.ts
│   │   │   └── layout.tsx
│   │   │
│   │   └── (frontend)/           # Site public multi-tenant
│   │       ├── layout.tsx        # Layout racine frontend
│   │       ├── [domain]/         # Route dynamique par tenant
│   │       │   ├── layout.tsx    # Layout tenant (header, footer)
│   │       │   ├── page.tsx      # Page d'accueil église
│   │       │   ├── loading.tsx   # Loading state
│   │       │   ├── error.tsx     # Error boundary
│   │       │   │
│   │       │   ├── events/       # Calendrier public
│   │       │   │   ├── page.tsx  # Liste événements
│   │       │   │   └── [id]/
│   │       │   │       └── page.tsx  # Détail événement
│   │       │   │
│   │       │   ├── login/        # Espace membre
│   │       │   │   └── page.tsx  # Formulaire connexion
│   │       │   │
│   │       │   └── dashboard/    # Dashboard bénévole (protégé)
│   │       │       ├── layout.tsx    # Layout dashboard + auth check
│   │       │       ├── page.tsx      # Accueil dashboard
│   │       │       └── events/
│   │       │           ├── page.tsx      # Liste mes événements
│   │       │           ├── new/
│   │       │           │   └── page.tsx  # Créer événement
│   │       │           └── [id]/
│   │       │               └── edit/
│   │       │                   └── page.tsx  # Modifier événement
│   │
│   ├── components/
│   │   ├── ui/                   # Shadcn/ui (auto-généré)
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   └── toaster.tsx
│   │   │
│   │   ├── features/
│   │   │   ├── events/           # Composants événements
│   │   │   │   ├── event-card.tsx
│   │   │   │   ├── event-form.tsx
│   │   │   │   ├── event-list.tsx
│   │   │   │   └── event-calendar.tsx
│   │   │   │
│   │   │   ├── churches/         # Composants église
│   │   │   │   ├── church-header.tsx
│   │   │   │   └── church-info.tsx
│   │   │   │
│   │   │   └── dashboard/        # Composants dashboard
│   │   │       ├── dashboard-nav.tsx
│   │   │       ├── quick-actions.tsx
│   │   │       └── welcome-card.tsx
│   │   │
│   │   └── layout/               # Composants layout
│   │       ├── header.tsx
│   │       ├── footer.tsx
│   │       ├── sidebar.tsx
│   │       └── mobile-nav.tsx
│   │
│   └── lib/                      # Utilitaires
│       ├── utils.ts              # cn(), helpers généraux
│       ├── tenant.ts             # getTenantFromDomain(), etc.
│       └── payload.ts            # getPayloadClient(), queries
│
└── tests/                        # Tests (existant)
    ├── helpers/                  # Helpers tests (existant)
    │   ├── login.ts
    │   └── seedUser.ts
    ├── int/                      # Tests intégration
    │   ├── api.int.spec.ts       # (existant)
    │   ├── churches.int.spec.ts
    │   └── events.int.spec.ts
    └── e2e/                      # Tests E2E
        ├── admin.e2e.spec.ts     # (existant)
        ├── frontend.e2e.spec.ts  # (existant)
        ├── login.e2e.spec.ts
        └── events.e2e.spec.ts
```

### Architectural Boundaries

**API Boundaries :**
| Boundary | Endpoint | Accès |
|----------|----------|-------|
| Payload REST | `/api/{collection}` | Access Control par collection |
| Auth | `/api/users/login`, `/api/users/logout` | Public |
| Media | `/api/media` | Tenant-scoped |

**Component Boundaries :**
| Couche | Responsabilité | Communication |
|--------|----------------|---------------|
| `(payload)` | Admin Super-Admin | Direct Payload |
| `(frontend)/[domain]` | Site public + Dashboard | REST API + Server Components |
| `/components/ui` | Primitives UI | Props only |
| `/components/features` | Logique métier | Hooks + Server Actions |

**Data Boundaries :**
| Collection | Scope | Access Control |
|------------|-------|----------------|
| Churches | Global (Super-Admin) | `isSuperAdmin()` |
| Users | Tenant | `belongsToChurch()` |
| Events | Tenant | `belongsToChurch()` |
| Media | Tenant | `belongsToChurch()` |

### Requirements to Structure Mapping

**FR1-5 (Auth) →**
- `/src/collections/Users.ts` — Champs role, church
- `/src/access/roles.ts` — Vérification permissions
- `/src/app/(frontend)/[domain]/login/` — UI connexion

**FR6-10 (Multi-tenant) →**
- `/src/collections/Churches.ts` — Définition tenant
- `/src/middleware.ts` — Résolution domaine → tenant
- `/src/lib/tenant.ts` — Helpers tenant

**FR11-16 (Events) →**
- `/src/collections/Events.ts` — Schema événement
- `/src/components/features/events/` — UI événements
- `/src/app/(frontend)/[domain]/events/` — Pages calendrier
- `/src/app/(frontend)/[domain]/dashboard/events/` — CRUD bénévole

**FR17-20 (Dashboard) →**
- `/src/app/(frontend)/[domain]/dashboard/` — Pages dashboard
- `/src/components/features/dashboard/` — Composants dashboard

**FR21-25 (Site Public) →**
- `/src/app/(frontend)/[domain]/` — Routes publiques
- `/src/components/layout/` — Header, Footer

### Integration Points

**Tenant Resolution Flow :**
```
Request → middleware.ts → resolve domain → inject tenant context
       → (frontend)/[domain] → fetch with tenant filter
       → Access Control → validate church relation
```

**Event Creation Flow (Marie-Claire) :**
```
Dashboard → event-form.tsx → Server Action
         → Payload REST API → Events collection
         → Access Control → validate church + role
         → revalidatePath() → update cache
         → Toast → "Événement ajouté ✓"
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
Toutes les technologies choisies sont officiellement compatibles :
- Payload CMS v3.74.0 intégré nativement avec Next.js 15.4.11
- PostgreSQL supporté via @payloadcms/db-postgres officiel
- Shadcn/ui compatible React 19 et Tailwind CSS
- ISR natif Next.js App Router

**Pattern Consistency:**
- Conventions de nommage alignées avec l'écosystème (kebab-case)
- Patterns d'Access Control cohérents avec le modèle multi-tenant
- Structure de composants suit les best practices React/Next.js

**Structure Alignment:**
- Route groups séparent clairement admin et frontend
- Routing dynamique `[domain]` supporte le multi-tenant
- Access helpers centralisés évitent la duplication

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
| Catégorie | FRs | Couverture |
|-----------|-----|------------|
| Authentification | FR1-5 | 100% via Payload Auth + roles |
| Multi-tenant | FR6-10 | 100% via Churches + middleware |
| Événements | FR11-16 | 100% via Events + dashboard routes |
| Dashboard | FR17-20 | 100% via dashboard routes + components |
| Site Public | FR21-25 | 100% via (frontend)/[domain] |
| Admin Payload | FR26-29 | 100% via (payload) existant |

**Non-Functional Requirements Coverage:**
| Catégorie | NFRs | Couverture |
|-----------|------|------------|
| Performance | NFR1-4 | ✅ ISR + Tailwind JIT + React Server Components |
| Sécurité | NFR5-9 | ✅ Access Control + HTTP-only cookies + HTTPS |
| Fiabilité | NFR10-12 | ✅ PostgreSQL ACID + backups Neon |
| Accessibilité | NFR13-15 | ✅ Shadcn/ui WCAG AA compliant |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ Stack technique avec versions exactes
- ✅ Patterns avec exemples de code
- ✅ Anti-patterns documentés
- ✅ Enforcement guidelines clairs

**Structure Completeness:**
- ✅ Arborescence complète jusqu'aux fichiers
- ✅ Mapping FR → fichiers explicite
- ✅ Integration points documentés

**Pattern Completeness:**
- ✅ Naming, structure, format, communication, process
- ✅ Exemples concrets pour chaque pattern
- ✅ Guidelines pour agents IA

### Gap Analysis Results

**Critical Gaps:** Aucun

**Important Gaps (Post-MVP):**
- Logging structuré (Winston/Pino)
- Monitoring/alerting (Coolify metrics)
- Rate limiting API

**Nice-to-Have:**
- Tests Lighthouse automatisés en CI
- Storybook pour documentation UI
- Swagger/OpenAPI auto-généré

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Contexte projet analysé (29 FRs, 15 NFRs)
- [x] Complexité évaluée (Medium)
- [x] Contraintes techniques identifiées
- [x] Cross-cutting concerns mappés

**✅ Architectural Decisions**
- [x] Stack avec versions vérifiées
- [x] Data architecture multi-tenant
- [x] Authentication & Security
- [x] API patterns
- [x] Frontend architecture
- [x] Infrastructure & Deployment

**✅ Implementation Patterns**
- [x] Naming conventions
- [x] Structure patterns
- [x] Format patterns
- [x] Communication patterns
- [x] Process patterns

**✅ Project Structure**
- [x] Directory structure complète
- [x] Component boundaries
- [x] Integration points
- [x] Requirements mapping

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH
- Stack éprouvé (Payload + Next.js)
- Patterns clairs et documentés
- Structure détaillée
- Tous les FRs couverts

**Key Strengths:**
- Architecture multi-tenant robuste dès le MVP
- Payload Access Control natif pour la sécurité
- Structure extensible pour les phases futures
- Conventions alignées avec l'écosystème

**Areas for Future Enhancement:**
- Logging et monitoring en production
- Tests de performance automatisés
- Documentation API interactive

### Implementation Handoff

**AI Agent Guidelines:**
1. Suivre les décisions architecturales exactement comme documentées
2. Utiliser les patterns d'implémentation de manière cohérente
3. Respecter la structure projet et les boundaries
4. Consulter ce document pour toute question architecturale

**First Implementation Priority:**
1. Créer collection Churches avec Access Control
2. Étendre Users avec church relation + role enum
3. Créer collection Events
4. Implémenter middleware tenant resolution
5. Ajouter Access Control sur toutes les collections

