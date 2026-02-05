# Story 4.6: Performance Optimization

**Epic:** 4 - Public Church Site
**NFRs:** NFR1, NFR2, NFR3, NFR4

---

**As a** visitor on a slow connection,
**I want** the site to load quickly,
**So that** I don't give up waiting.

## Acceptance Criteria

**Given** the public site is deployed
**When** I run Lighthouse audit on mobile
**Then** Performance score is > 90
**And** Time to Interactive is < 3 seconds on 3G
**And** images are optimized (WebP, lazy loading)
**And** CSS is minimal (Tailwind purge)

## Technical Notes

- Use Next.js Image component
- Enable ISR with appropriate revalidation
- Minimize client-side JavaScript
