<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Gulshan Dynasty Community Portal — Agent Guide

> **What this is:** A resident-facing community portal (RWA) for Gulshan Dynasty, Sector 144, Noida — 204 homes across 3 towers. **Not** a sales/marketing site.
>
> **Audience for this doc:** AI coding agents working in this repository.

---

## Quick orientation

| Topic | Location |
|---|---|
| Functional spec | `docs/FUNCTIONAL-SPEC.md` |
| Architecture & data model | `docs/ARCHITECTURE.md` |
| Profile linking rules | `docs/DESIGN-PROFILES.md` |
| UI/UX casual makeover tracker | `docs/tracking/ui-ux-casual-makeover-log.md` |
| Hub redesign backlog | `docs/tracking/backlog-hub-redesign.md` |
| Product backlog | `docs/BACKLOG.md` |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| React | 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + `tw-animate-css` |
| UI primitives | shadcn v4 (`@base-ui/react` under the hood) |
| Icons | `lucide-react` |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Database | PostgreSQL |
| Auth | NextAuth v5 (JWT sessions) |
| File storage | MinIO (S3-compatible) |
| Fonts | Inter (body), Plus Jakarta Sans (headings) |

**Prisma client output:** `src/generated/prisma/` — import from `@/generated/prisma/client`, never edit generated files.

---

## Development commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run db:migrate   # Prisma migrate dev
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:seed:dev  # Seed dev data
npm run db:studio    # Prisma Studio
```

After changing `prisma/schema.prisma`, always run `db:generate` (and `db:migrate` if schema changed).

---

## Environment variables

Copy `.env.example` → `.env.local`. Key vars:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | Auth |
| `NEXT_PUBLIC_APP_URL` | Public app URL (used in metadata, dev login gate) |
| `GOOGLE_*` / `APPLE_*` | OAuth providers |
| `SMTP_*` / `EMAIL_FROM` | Magic-link email (optional) |
| `MINIO_*` | File uploads |
| `SETUP_SECRET` | Bootstrap admin setup |

Dev quick-login is shown on `/login` when `NEXT_PUBLIC_APP_URL` includes `localhost`. Uses Credentials provider (dev only).

---

## Project structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── page.tsx            # Community Hub (/) — resident home
│   ├── admin/              # Admin panel (enterprise shell, separate from resident UI)
│   ├── api/                # Route handlers
│   └── [feature]/          # Resident feature pages
├── components/
│   ├── hub/                # Community Hub widgets
│   ├── shell/              # ResidentShell, CasualHeader, MobileBottomNav
│   ├── dashboard/          # DashboardLayout → wraps ResidentShell
│   ├── shared/             # Reusable: PageHeader, IconTile, SoftCard, UserLink, etc.
│   ├── ui/                 # shadcn primitives — extend, don't fork
│   └── [feature]/          # Feature-specific components
├── lib/                    # Server utilities: auth, db, rbac, hub-data, microcopy
├── types/                  # Shared TypeScript types (e.g. hub.ts)
└── generated/prisma/       # Generated — do not edit
prisma/
├── schema.prisma
└── seed.ts
docs/                       # Specs, architecture, tracking logs
```

**Path alias:** `@/*` → `src/*`

---

## Architecture patterns

### App Router conventions

- Most data pages use `export const dynamic = "force-dynamic"` — no static caching for authenticated content.
- Server Components by default; add `"use client"` only when needed (forms, hooks, animations).
- Wrap async page content in `<Suspense fallback={...}>` where skeletons exist (`src/components/shared/skeletons.tsx`).
- `searchParams` and `params` are **Promises** in Next.js 16 — always `await` them in page components.

### Authentication

- `auth()` from `@/lib/auth` — use in Server Components and route handlers.
- Session is JWT-based; user fields on session: `id`, `globalRole`, `approvalStatus`, `isActive`, `termsAcceptedAt`.
- New OAuth users are created with `approvalStatus: PENDING` in the `signIn` callback.
- **Do not use Prisma in middleware** — JWT verification only (`src/middleware.ts`).

Protected routes in middleware: `/dashboard`, `/admin`, `/profile`, `/notifications`, `/directory`. Most resident routes (tickets, notices, facilities, etc.) rely on page-level `auth()` + redirect.

### Database

```ts
import { db } from "@/lib/db";
```

- Singleton Prisma client with PG adapter.
- Use `select` to limit fields; parallelize independent queries with `Promise.all`.
- Wrap DB calls in try/catch on pages — return empty fallbacks or error UI, don't crash.

### RBAC

```ts
import { isAdmin, hasActiveUnitRole, getUserUnitMemberships } from "@/lib/rbac";
```

| Role | Access |
|---|---|
| `SUPER_ADMIN` / `ADMIN` | Admin panel + resident features |
| `RESIDENT` | Resident features (after approval) |
| `SECURITY_STAFF` | Gate validation |
| `NON_RESIDENT` | Limited |

Unit-level roles (`OWNER`, `TENANT`, etc.) are time-bound via `UnitMembership.startDate` / `endDate`. Always filter active memberships:

```ts
OR: [{ endDate: null }, { endDate: { gt: new Date() } }]
```

### API routes

- Location: `src/app/api/[resource]/route.ts`
- Validate input, return `NextResponse.json({ error }, { status })` on failure.
- Rate limiting on `/api/*` (except `/api/auth`) — 100 req/min per IP in middleware.
- Check `auth()` for protected endpoints.

### File uploads

MinIO via `@/lib/minio`. Use `FileUpload` component (`src/components/shared/file-upload.tsx`) for consistent UX.

---

## UI architecture (resident vs admin)

### Resident shell (casual, consumer-app feel)

Resident pages wrap content in `DashboardLayout` → `ResidentShell`:

- `CasualHeader` — sticky top nav, icon pills, avatar menu
- `MobileBottomNav` — 5-tab bottom bar on mobile (Home, Book, Guests, Help, More)
- No dark sidebar

**Use these shared components for resident pages:**

| Component | When to use |
|---|---|
| `PageHeader` | Page title with feature icon + subtitle + action |
| `IconTile` | Shortcut / quick-action grid |
| `SoftCard` | Content cards (shadow, optional accent stripe) |
| `FriendlyBadge` | Status/priority — shows "Urgent" not `EMERGENCY` |
| `EmptyState` | List pages with no data |
| `FadeIn` / `StaggerChildren` | Entrance animations |
| `UserLink` / `UnitLink` | **Always** for user names and unit numbers (see DESIGN-PROFILES.md) |

### Microcopy

Resident-facing copy lives in `src/lib/microcopy.ts`. Use it — don't hardcode enterprise labels:

| Avoid | Prefer |
|---|---|
| Helpdesk | Get help |
| Bookings | Book a spot |
| Notices | What's new |
| New Ticket | Ask for help |
| EMERGENCY | Urgent (via `FriendlyBadge`) |

Feature colors: `src/lib/feature-colors.ts` — one pastel per feature area.

### Admin shell (enterprise, intentional)

`src/app/admin/layout.tsx` — dark sidebar, utilitarian. **Do not** apply casual makeover to admin unless explicitly requested. Track in `docs/tracking/ui-ux-casual-makeover-log.md` item CAS-017.

### Design tokens

`src/app/globals.css` — CSS variables for colors, radius (`0.75rem`), sidebar (light). Gold accent: `--gold: #d4af37`. Respect `prefers-reduced-motion` — animation classes disable automatically.

### shadcn / Base UI

- Components in `src/components/ui/` — generated via shadcn CLI.
- `Button` uses `@base-ui/react/button` with `render` prop pattern for links: `render={<Link href="..." />}`.
- Use `cn()` from `@/lib/utils` for class merging.

---

## Coding conventions

### Scope

- **Minimize diff** — only change what's needed for the task.
- Match existing patterns in the file you're editing.
- Don't add tests unless requested or they cover real behavior.
- Don't create commits unless the user asks.

### TypeScript

- Strict mode — no `any` unless unavoidable (prefer typing session extensions).
- Colocate types in `src/types/` when shared across components.
- Import Prisma enums from `@/generated/prisma/enums`.

### Components

- Server Components for data fetching; client for interactivity.
- Forms: use `useTransition` for pending states, `Loader2` spinner, `htmlFor`/`id` on labels.
- Date validation: end date must be after start date on event/visitor/poll forms.

### Mobile responsiveness

- **Touch targets**: All interactive elements ≥44×44px on mobile (`min-h-11` or padding). Global CSS rule in `globals.css` enforces this.
- **iOS zoom prevention**: Inputs use `font-size: 16px` on mobile via global CSS rule. Never use `text-sm` on inputs without `md:text-sm`.
- **Page headers**: Use `flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between` pattern. Action button full-width on mobile.
- **Tables**: Use `md:hidden` card list + `hidden md:block` table pattern. Never use `min-w-[...]` on tables.
- **Filter pills**: Use `overflow-x-auto flex-nowrap snap-x snap-mandatory scrollbar-hide` for horizontal scroll on mobile.
- **Bottom nav**: Primary nav (Home, Book, Guests, Help). "More" opens sheet with overflow items. Guest users see login redirect.
- **Safe area**: Header has `pt-[env(safe-area-inset-top)]`. Bottom padding uses `pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)]`.
- **Breadcrumb**: Truncate leaf with `truncate max-w-[120px] sm:max-w-none`.

### Links & profiles

Per `docs/DESIGN-PROFILES.md`:

- Every user name → `<UserLink userId={...} name={...} />`
- Every unit number → `<UnitLink unitNumber={...} />`
- Tower colors: A=gold, B=teal, C=rose

### Pages checklist (resident)

When adding or updating a resident list page:

1. `auth()` + redirect to `/login` if unauthenticated
2. Fetch user for layout: `{ name, email, globalRole }`
3. Wrap in `<DashboardLayout user={user}>`
4. Use `PageHeader` + feature key from `feature-colors.ts`
5. Use `SoftCard` or styled links for list items
6. Use `EmptyState` with copy from `microcopy.ts`
7. Use `FriendlyBadge` for status/priority enums

---

## Key domain concepts

| Concept | Details |
|---|---|
| Unit naming | `{Tower}-{Floor}{Unit}` e.g. `C-0302` (regex: `^[ABC]-\d{4}$`) |
| Towers | A, B, C — 34 floors, 2 units/floor, 6 duplexes on top floors |
| Notices | Tower-filtered via `targetBlock`; priority: NORMAL / IMPORTANT / EMERGENCY |
| Visitor passes | QR display, OTP validation at gate |
| Facilities | Bookable amenities with slot grid, waitlist, blackouts |
| Polls | Global or sub-community scoped; proxy voting supported |
| Dues | Per-unit pending payments |
| Hub | `/` — single-viewport community home for guests and residents |

---

## Tracking & backlog workflow

Active UI/UX work is tracked in `docs/tracking/ui-ux-casual-makeover-log.md` (42 items, dependency-ordered). When implementing a tracked item:

1. Check dependencies are `DONE`
2. Implement per acceptance criteria
3. Update the item's `Status` column to `DONE`
4. Update progress summary counts

Do not create new tracking markdown files unless the user asks — extend existing logs.

---

## Common pitfalls

| Pitfall | Correct approach |
|---|---|
| Using Playfair Display | Use Plus Jakarta Sans (`--font-heading` in layout) |
| Dark sidebar on resident pages | Use `ResidentShell` / `DashboardLayout` |
| Raw enum labels in UI (`EMERGENCY`, `IN_PROGRESS`) | Use `FriendlyBadge` + `microcopy.ts` |
| Plain text user/unit references | Use `UserLink` / `UnitLink` |
| Editing `src/generated/prisma/` | Run `npm run db:generate` instead |
| Prisma in middleware or edge | Keep DB access in Server Components / route handlers |
| `searchParams` without await | `const params = await searchParams` |
| Forgetting `force-dynamic` on auth pages | Add `export const dynamic = "force-dynamic"` |
| Corporate copy on resident UI | Check `src/lib/microcopy.ts` first |
| Over-engineering helpers | Inline simple logic; reuse existing lib/components |

---

## Build verification

Before considering work complete:

```bash
npm run lint
npm run build
```

Note: pre-existing build errors in unrelated files (e.g. `admin/users/page.tsx`) may exist — fix errors in files you touched; don't scope-creep unless asked.

---

## Next.js 16 reference

When unsure about App Router APIs, caching, or breaking changes, consult:

```
node_modules/next/dist/docs/01-app/
```

Key areas: `02-guides/`, `03-api-reference/04-functions/`, `03-api-reference/01-directives/`.

---

*Last updated: 2026-07-06*
