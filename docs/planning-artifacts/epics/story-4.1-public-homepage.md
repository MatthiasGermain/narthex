# Story 4.1: Public Homepage

**Epic:** 4 - Public Church Site
**FRs:** FR21, FR24

---

**As a** visitor,
**I want** to see the church's homepage,
**So that** I can learn about the church.

## Acceptance Criteria

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

## Technical Notes

- File: `/src/app/(frontend)/[domain]/page.tsx`
- Uses ISR for performance
