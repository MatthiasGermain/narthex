# Story 2.1: Create Login Page

**Epic:** 2 - User Authentication
**FRs:** FR1

---

**As a** church member,
**I want** to login with my email and password,
**So that** I can access my church's dashboard.

## Acceptance Criteria

**Given** I am on the login page `/[domain]/login`
**When** I enter my email and password and click "Se connecter"
**Then** I am authenticated via Payload Auth
**And** I am redirected to `/[domain]/dashboard`
**And** my session includes my church and role

**Given** I enter invalid credentials
**When** I click "Se connecter"
**Then** I see an error message "Email ou mot de passe incorrect"
**And** I remain on the login page

## Technical Notes

- File: `/src/app/(frontend)/[domain]/login/page.tsx`
- Uses Payload REST API `/api/users/login`
- Shadcn/ui form components (Input, Button, Label)
