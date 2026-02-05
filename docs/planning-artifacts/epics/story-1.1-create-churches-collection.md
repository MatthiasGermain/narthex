# Story 1.1: Create Churches Collection

**Epic:** 1 - Multi-tenant Foundation
**FRs:** FR6, FR7, FR8

---

**As a** Super-Admin,
**I want** to define church entities in the system,
**So that** I can create and manage multiple church tenants.

## Acceptance Criteria

**Given** I am logged in as Super-Admin in Payload Admin
**When** I navigate to the Churches collection
**Then** I can create a new church with:
- `name` (text, required) — Display name
- `slug` (text, unique, required) — URL identifier
- `domains` (array of text) — Allowed domains
- `logo` (upload, relation to Media)
- `colors` (group: primary, secondary)
- `settings` (group: enabled modules)
**And** the collection has proper indexes on `slug` and `domains`

## Technical Notes

- File: `/src/collections/Churches.ts`
- Access: Super-Admin only for all operations
