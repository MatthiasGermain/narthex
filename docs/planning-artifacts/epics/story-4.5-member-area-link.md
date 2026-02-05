# Story 4.5: Member Area Link

**Epic:** 4 - Public Church Site
**FRs:** FR25

---

**As a** visitor,
**I want** to find the login page easily,
**So that** I can access member features if I have an account.

## Acceptance Criteria

**Given** I am on any public page
**When** I look at the header/navigation
**Then** I see an "Espace membre" link
**And** clicking it takes me to `/[domain]/login`

**Given** I am already logged in
**When** I see the header
**Then** "Espace membre" is replaced by "Mon espace" linking to dashboard

## Technical Notes

- Conditional rendering in header based on auth state
