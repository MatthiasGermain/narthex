# Story 3.4: Event Creation Form

**Epic:** 3 - Event Management (Core MVP)
**FRs:** FR11, FR15, FR16

---

**As a** volunteer,
**I want** to add a new event in under 1 minute,
**So that** the church calendar stays up to date.

## Acceptance Criteria

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

## Technical Notes

- File: `/src/app/(frontend)/[domain]/dashboard/events/new/page.tsx`
- Component: `/src/components/features/events/event-form.tsx`
- Uses Server Action or REST API POST to `/api/events`
