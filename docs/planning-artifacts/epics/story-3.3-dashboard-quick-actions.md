# Story 3.3: Dashboard Home with Quick Actions

**Epic:** 3 - Event Management (Core MVP)
**FRs:** FR18, FR19, FR20

---

**As a** volunteer,
**I want** to see quick actions on my dashboard,
**So that** I can immediately do what I came for.

## Acceptance Criteria

**Given** I am on the dashboard home `/[domain]/dashboard`
**When** the page loads
**Then** I see:
- A welcome message with my name
- Quick action buttons: "Ajouter un événement", "Voir le calendrier"
- Optionally: recent events I created
**And** vocabulary is church-friendly (no technical jargon)
**And** only modules enabled for this tenant are shown

## Technical Notes

- File: `/src/app/(frontend)/[domain]/dashboard/page.tsx`
- Components: `welcome-card.tsx`, `quick-actions.tsx`
