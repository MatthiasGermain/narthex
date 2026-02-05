# Story 3.5: Event List in Dashboard

**Epic:** 3 - Event Management (Core MVP)
**FRs:** FR19

---

**As a** volunteer,
**I want** to see all events for my church,
**So that** I can manage them.

## Acceptance Criteria

**Given** I am on `/[domain]/dashboard/events`
**When** the page loads
**Then** I see a list of events for my church:
- Title, date, time, visibility badge
- Actions: "Modifier", "Supprimer"
**And** events are sorted by date (upcoming first)
**And** I can filter by visibility (Public/Interne)

## Technical Notes

- File: `/src/app/(frontend)/[domain]/dashboard/events/page.tsx`
- Component: `/src/components/features/events/event-list.tsx`
- Fetches via Payload REST API with church filter
