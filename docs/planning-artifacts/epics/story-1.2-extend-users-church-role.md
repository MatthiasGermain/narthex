# Story 1.2: Extend Users with Church & Role

**Epic:** 1 - Multi-tenant Foundation
**FRs:** FR9, FR4

---

**As a** Super-Admin,
**I want** users to be linked to a specific church with a defined role,
**So that** access can be controlled per tenant.

## Acceptance Criteria

**Given** the Churches collection exists
**When** I create or edit a user in Payload Admin
**Then** I can assign:
- `church` (relationship to Churches, required for non-super-admin)
- `role` (select: 'super-admin', 'admin-church', 'volunteer')
**And** Super-Admin users have no church restriction
**And** other users must have a church assigned

## Technical Notes

- File: `/src/collections/Users.ts` (extend existing)
- Role enum defined as Payload select field
