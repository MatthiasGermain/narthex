# Story 2.4: Auth Protected Routes

**Epic:** 2 - User Authentication
**FRs:** FR4, FR5

---

**As a** system,
**I want** dashboard routes protected by authentication,
**So that** only logged-in users can access them.

## Acceptance Criteria

**Given** I am not logged in
**When** I try to access `/[domain]/dashboard`
**Then** I am redirected to `/[domain]/login`
**And** after login, I am redirected back to dashboard

**Given** I am logged in as a user from Church A
**When** I try to access `/church-b/dashboard`
**Then** I see a 403 or am redirected to my own church

## Technical Notes

- File: `/src/app/(frontend)/[domain]/dashboard/layout.tsx`
- Server-side auth check using Payload cookies
