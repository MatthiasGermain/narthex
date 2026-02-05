# Story 1.6: Create First Tenant (Spotlight)

**Epic:** 1 - Multi-tenant Foundation

---

**As a** Super-Admin,
**I want** to create the first church tenant for Spotlight,
**So that** development can proceed with real data.

## Acceptance Criteria

**Given** Churches collection and middleware exist
**When** I create the Spotlight tenant in Payload Admin
**Then** it has:
- `name`: "Spotlight"
- `slug`: "spotlight"
- `domains`: ["spotlight.localhost"]
- `colors`: (from charte graphique PDF)
**And** I can access `spotlight.localhost:3000` and see it resolves
**And** I can create a test user (volunteer) linked to Spotlight

## Technical Notes

- Manual creation via Payload Admin
- Seed script optional for dev environment
