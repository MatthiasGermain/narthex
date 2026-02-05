# Story 1.4: Implement Tenant Routing Middleware

**Epic:** 1 - Multi-tenant Foundation
**FRs:** FR10

---

**As a** visitor,
**I want** to access a church site via its domain or subdomain,
**So that** I see the correct church content.

## Acceptance Criteria

**Given** I access `eglise-demo.localhost:3000` (dev) or `eglise-demo.com` (prod)
**When** the middleware processes the request
**Then** it resolves the tenant from:
- Subdomain of `.localhost` in development
- Query param `?tenant=xxx` as fallback in development
- Custom domain lookup in Churches.domains in production
**And** the tenant context is injected into the request
**And** 404 is returned if no matching tenant is found

## Technical Notes

- File: `/src/middleware.ts`
- Uses Payload Local API to query Churches collection
