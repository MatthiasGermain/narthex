# Story 3.2: Create Dashboard Layout

**Epic:** 3 - Event Management (Core MVP)
**FRs:** FR17

---

**As a** logged-in volunteer,
**I want** a dedicated dashboard area,
**So that** I have a clear workspace for my tasks.

## Acceptance Criteria

**Given** I am logged in and access `/[domain]/dashboard`
**When** the page loads
**Then** I see:
- A header with church name/logo and my name
- A "Déconnexion" button
- A sidebar or nav with available actions
- Main content area
**And** the design uses Shadcn/ui components
**And** the layout is responsive (mobile-friendly)

## Technical Notes

- File: `/src/app/(frontend)/[domain]/dashboard/layout.tsx`
- Components: `/src/components/features/dashboard/`
