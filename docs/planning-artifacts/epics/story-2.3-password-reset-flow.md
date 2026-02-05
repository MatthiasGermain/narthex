# Story 2.3: Password Reset Flow

**Epic:** 2 - User Authentication
**FRs:** FR3

---

**As a** user who forgot my password,
**I want** to reset it via email,
**So that** I can regain access to my account.

## Acceptance Criteria

**Given** I am on the login page
**When** I click "Mot de passe oublié ?"
**Then** I see a form to enter my email

**Given** I enter my registered email
**When** I click "Envoyer"
**Then** Payload sends a password reset email
**And** I see "Un email vous a été envoyé"

**Given** I click the reset link in my email
**When** I enter a new password
**Then** my password is updated
**And** I can login with my new password

## Technical Notes

- Uses Payload built-in forgot-password/reset-password
- Page: `/[domain]/login/forgot-password`
- Page: `/[domain]/login/reset-password`
