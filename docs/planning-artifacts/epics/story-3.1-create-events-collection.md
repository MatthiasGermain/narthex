# Story 3.1: Create Events Collection

**Epic:** 3 - Event Management (Core MVP)
**FRs:** FR14, FR15

---

**As a** developer,
**I want** an Events collection in Payload,
**So that** events can be stored and managed per church.

## Acceptance Criteria

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

## Technical Notes

- File: `/src/collections/Events.ts`
- Uses Access Control helpers from `/src/access/`
