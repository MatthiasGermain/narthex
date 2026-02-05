# Story 3.6: Edit Event

**Epic:** 3 - Event Management (Core MVP)
**FRs:** FR12, FR16

---

**As a** volunteer,
**I want** to modify an existing event,
**So that** I can correct mistakes or update details.

## Acceptance Criteria

**Given** I click "Modifier" on an event
**When** I am on `/[domain]/dashboard/events/[id]/edit`
**Then** I see the event form pre-filled with current values
**And** I can update any field
**And** I click "Enregistrer"
**Then** the event is updated via Payload REST API
**And** I see a Toast: "Événement modifié ✓"
**And** I am redirected to the event list

## Technical Notes

- File: `/src/app/(frontend)/[domain]/dashboard/events/[id]/edit/page.tsx`
- Reuses `event-form.tsx` component in edit mode
