# Story 4.4: Event Detail Page

**Epic:** 4 - Public Church Site
**FRs:** FR23

---

**As a** visitor,
**I want** to see full details of an event,
**So that** I have all the information I need to attend.

## Acceptance Criteria

**Given** I click on an event from the calendar
**When** I am on `/[domain]/events/[id]`
**Then** I see:
- Event title (large)
- Date and time (formatted nicely: "Samedi 20 décembre à 20h")
- Location with optional map link
- Full description
- Back link to calendar
**And** if the event is internal and I'm not logged in, I see 404

## Technical Notes

- File: `/src/app/(frontend)/[domain]/events/[id]/page.tsx`
- Component: `/src/components/features/events/event-card.tsx` (detail variant)
