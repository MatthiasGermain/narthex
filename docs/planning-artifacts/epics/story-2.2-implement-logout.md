# Story 2.2: Implement Logout

**Epic:** 2 - User Authentication
**FRs:** FR2

---

**As a** logged-in user,
**I want** to logout from my session,
**So that** my account is secure on shared devices.

## Acceptance Criteria

**Given** I am logged in
**When** I click "Déconnexion"
**Then** my session is terminated via Payload Auth
**And** I am redirected to the public homepage `/[domain]`
**And** I can no longer access protected routes

## Technical Notes

- Uses Payload REST API `/api/users/logout`
- Button in dashboard header/nav
