# Story 1.3: Create Access Control Helpers

**Epic:** 1 - Multi-tenant Foundation
**FRs:** FR5, FR26, FR27, FR28, FR29

---

**As a** developer,
**I want** centralized access control functions,
**So that** tenant isolation is consistent across all collections.

## Acceptance Criteria

**Given** Users have church and role fields
**When** Access Control is evaluated on any collection
**Then** helpers provide:
- `isSuperAdmin(req)` — Returns true if user is super-admin
- `belongsToChurch(req)` — Returns query filter `{ church: { equals: user.church } }`
- `isAdmin(req)` — Returns true if admin-church or super-admin
- `isVolunteer(req)` — Returns true if volunteer or higher
**And** helpers are exported from `/src/access/index.ts`

## Technical Notes

- Files: `/src/access/tenant.ts`, `/src/access/roles.ts`, `/src/access/index.ts`
