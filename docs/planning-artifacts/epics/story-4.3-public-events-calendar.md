# Story 4.3: Public Events Calendar

**Epic:** 4 - Public Church Site
**FRs:** FR22

---

**As a** visitor,
**I want** to see upcoming public events,
**So that** I can plan to attend.

## Acceptance Criteria

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

## Technical Notes

- File: `/src/app/(frontend)/[domain]/events/page.tsx`
- Component: `/src/components/features/events/event-list.tsx` (public variant)
- Filters: `{ visibility: { equals: 'public' }, church: { equals: tenantId } }`
