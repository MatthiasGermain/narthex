# Story 1.5: Setup Tailwind & Shadcn/ui

**Epic:** 1 - Multi-tenant Foundation
**NFRs:** NFR13, NFR14, NFR15 (accessibility foundation)

---

**As a** developer,
**I want** Tailwind CSS and Shadcn/ui configured,
**So that** I can build accessible UI components quickly.

## Acceptance Criteria

**Given** the Next.js project exists
**When** I run the setup
**Then** Tailwind CSS is configured with:
- `tailwind.config.ts` with content paths
- `postcss.config.js`
- `globals.css` with Tailwind directives
**And** Shadcn/ui is initialized with:
- `components.json` configuration
- `/src/components/ui/` directory
- `cn()` utility in `/src/lib/utils.ts`

## Technical Notes

- Run: `pnpm add -D tailwindcss postcss autoprefixer`
- Run: `npx shadcn-ui@latest init`
