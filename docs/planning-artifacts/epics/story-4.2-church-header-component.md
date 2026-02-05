# Story 4.2: Church Header Component

**Epic:** 4 - Public Church Site
**FRs:** FR24

---

**As a** visitor,
**I want** to see the church's branding on every page,
**So that** I know which church site I'm on.

## Acceptance Criteria

**Given** I am on any public page
**When** the page loads
**Then** I see a header with:
- Church logo (from tenant config)
- Church name
- Navigation links (Accueil, Événements, Espace membre)
**And** the header uses the tenant's color scheme
**And** the header is responsive (hamburger menu on mobile)

## Technical Notes

- Component: `/src/components/layout/header.tsx`
- Component: `/src/components/features/churches/church-header.tsx`
- Fetches church data from tenant context
