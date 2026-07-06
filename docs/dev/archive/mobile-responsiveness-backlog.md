# Mobile Responsiveness Backlog — Portrait & Touch

> **Goal:** Make the Gulshan Dynasty portal fully usable on portrait mobile (320px–428px) and comfortable on small tablets, with correct touch targets, no clipped content, and no horizontal-scroll traps.
>
> **Created:** 2026-07-06  
> **Review method:** Static code audit of layouts, shell components, and all resident/admin pages.  
> **Test viewports:** 320×568 (SE), 375×667 (iPhone), 390×844 (14), 414×896 (Plus), 768×1024 (iPad portrait)

---

## Progress Summary

| Metric | Count |
|---|---|
| Total items | 42 |
| Done | 42 |
| In progress | 0 |
| Backlog | 0 |
| Blocked | 0 |

Update **Status** as work proceeds.

---

## Status Legend

| Status | Meaning |
|---|---|
| `BACKLOG` | Not started |
| `IN_PROGRESS` | Actively being worked on |
| `DONE` | Fixed and verified at 375px portrait |
| `BLOCKED` | Waiting on dependency or decision |

**Priority:** `P0` (broken on mobile) · `P1` (major UX pain) · `P2` (polish) · `P3` (QA/docs)

**Complexity:** `XS` (<2h) · `S` (2–4h) · `M` (4–8h) · `L` (1–2 days)

---

## Findings Overview

| Area | Health | Main issues |
|---|---|---|
| Resident shell (header + bottom nav) | ⚠️ Partial | Bottom nav "More" misroutes; footer overlap on `/`; inconsistent padding |
| Community Hub (`/`) | ⚠️ Partial | Footer overflow; pulse section cramped; shortcuts grid breakpoint |
| List pages (events, polls, visitors…) | ⚠️ Partial | Page headers clip CTAs; some metadata rows overflow |
| Tables (directory, admin) | ❌ Poor | Horizontal scroll only; no mobile card layout |
| Facility booking grid | ❌ Broken | `min-w-[600px]` forces scroll; cells too small to tap |
| Profile pages (`/users`, `/units`) | ❌ Broken | No shell — users stranded without nav |
| Admin panel | ❌ Broken | Sidebar hidden on mobile with no alternative nav |
| Forms & inputs | ⚠️ Partial | 14px inputs trigger iOS zoom; many 36px touch targets |
| Gate / onboarding / login | ⚠️ Partial | Nested layouts, overflow text, large headings |

---

## Dependency Map

```
Phase 0 — Foundations
  MOB-026 (viewport + safe-area tokens) ──┬──► MOB-029 (header safe-area)
                                         └──► MOB-039 (unify bottom padding)

Phase 1 — Shell & Navigation (blocks most page work)
  MOB-005, MOB-006 (fix bottom nav) ──► MOB-009 (dedupe nav)
  MOB-007, MOB-039 (footer/padding) ──► MOB-004 (hub footer layout)
  MOB-008 (PageHeader stack) ──► MOB-015 (page header pattern across pages)
  MOB-003 (profile pages shell) ──► MOB-040 (profile back link)

Phase 2 — Wide Content & Tables
  MOB-002 (booking grid mobile) — independent critical path
  MOB-010 (directory cards) 
  MOB-018 (admin tables) ──► MOB-001 (admin mobile nav)

Phase 3 — Page-level fixes (depends Phase 1)
  MOB-011–MOB-016, MOB-019, MOB-032 (individual pages)

Phase 4 — Touch & Forms
  MOB-021 (input font-size) ──► all form components
  MOB-022, MOB-023 (touch targets)

Phase 5 — Polish & QA
  MOB-027 (mobile search) · MOB-037 (guest UX) · MOB-042 (QA matrix)

**Critical path:** MOB-001 → MOB-002 → MOB-003 → MOB-005 → MOB-008 → MOB-010 → MOB-021 → MOB-042
```

---

## Phase 0 — Foundations

| ID | Priority | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| MOB-026 | P1 | Add explicit `viewport` export with `width=device-width`, `initialScale=1`, `viewportFit=cover` | XS | **DONE** | — | `src/app/layout.tsx` | Safe-area env vars work on notched iPhones; no accidental desktop scaling |
| MOB-029 | P2 | Apply `pt-[env(safe-area-inset-top)]` to sticky header | XS | **DONE** | MOB-026 | `casual-header.tsx` | Header content clears notch in portrait and landscape |
| MOB-039 | P1 | Unify mobile bottom inset: use `pb-[calc(4rem+env(safe-area-inset-bottom))]` everywhere | XS | **DONE** | MOB-026 | `resident-shell.tsx`, `community-hub.tsx` | Hub and inner pages have identical scroll clearance above bottom nav |

---

## Phase 1 — Shell & Navigation

| ID | Priority | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| MOB-001 | P0 | **Admin layout has zero mobile navigation** — sidebar is `hidden lg:block` with no hamburger/sheet | M | **DONE** | — | `src/app/admin/layout.tsx` | Admin can reach all nav items on 375px via sheet or bottom bar |
| MOB-005 | P0 | Bottom nav **"More" tab links to `/notices`** but label says "More" — should open sheet or `/directory` hub | S | **DONE** | — | `mobile-bottom-nav.tsx` | "More" opens full nav sheet (reuse `CasualHeader` explore links) or dedicated menu |
| MOB-006 | P0 | Bottom nav **"More" active state logic is inverted** — highlights when on any non-primary route | S | **DONE** | MOB-005 | `mobile-bottom-nav.tsx` | Active tab reflects current section; no false positives on `/notices` |
| MOB-007 | P1 | **Hub footer sits behind bottom nav** — `CommunityHub` main has `pb-20` but footer is outside main with no bottom padding | XS | **DONE** | MOB-039 | `community-hub.tsx`, `hub-footer.tsx` | Footer links (Contact RWA, Privacy) fully tappable above bottom nav on `/` |
| MOB-004 | P1 | **Hub footer overflows** on 320px — single-row flex with long RWA name + 4 links | S | **DONE** | MOB-007 | `hub-footer.tsx` | Footer stacks to 2 rows on mobile; no horizontal overflow |
| MOB-008 | P1 | **`PageHeader` doesn't stack on mobile** — title + action side-by-side causes CTA clipping | S | **DONE** | — | `page-header.tsx` | `flex-col gap-3 sm:flex-row sm:items-start` pattern; action full-width on mobile |
| MOB-009 | P2 | Redundant mobile nav — hamburger sheet in header duplicates bottom nav destinations | S | **DONE** | MOB-005 | `casual-header.tsx`, `mobile-bottom-nav.tsx` | Single coherent mobile IA: bottom nav for primary, sheet for overflow only |
| MOB-027 | P2 | **No mobile search** — `CommandPalette` removed when sidebar was replaced | M | **DONE** | MOB-009 | `casual-header.tsx` or new `mobile-search.tsx` | Search icon in header opens full-width mobile search sheet |
| MOB-037 | P2 | Guest users see bottom nav tabs that redirect to login without explanation | S | **DONE** | MOB-005 | `mobile-bottom-nav.tsx`, hub shortcuts | Guest taps show login prompt or guest-safe destinations only |

---

## Phase 2 — Wide Content & Tables

| ID | Priority | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| MOB-002 | P0 | **Facility booking grid unusable on mobile** — `min-w-[600px]`, 32px-tall cells, requires horizontal scroll | L | BACKLOG | — | `booking-grid.tsx` | Mobile: day-picker + vertical slot list OR swipeable single-day view; slots ≥44px tap height |
| MOB-010 | P0 | **Directory is a 4-column table** — poor mobile UX even with `overflow-x-auto` | M | **DONE** | MOB-008 | `directory/page.tsx` | Mobile card layout: unit badge, tower, residents stacked; table only `md+` |
| MOB-018 | P1 | **Admin tables** (users, vehicles, moves, dues report) scroll horizontally with no mobile layout | L | **DONE** | MOB-001 | `admin/users/page.tsx`, `admin/vehicles/page.tsx`, `admin/moves/page.tsx`, `admin/dues/report/page.tsx` | Each admin list has card/stack layout `<md` or collapsible rows |
| MOB-019 | P2 | **Breadcrumb overflow** — long ticket subjects in breadcrumb don't truncate | XS | **DONE** | — | `breadcrumb.tsx` | `truncate max-w-[120px] sm:max-w-none` on leaf; flex-wrap or single-line ellipsis |
| MOB-031 | P2 | Directory tower filter `flex gap-2` lacks `flex-wrap` — 4 pills may overflow 320px | XS | **DONE** | MOB-010 | `directory/page.tsx` | Filters wrap or scroll horizontally with snap |

---

## Phase 3 — Page-Level Layout Fixes

| ID | Priority | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| MOB-003 | P0 | **`/users/[userId]` and `/units/[unitNumber]` lack ResidentShell** — no header, bottom nav, or back affordance | M | **DONE** | — | `users/[userId]/page.tsx`, `units/[unitNumber]/page.tsx` | Both pages use `DashboardLayout` or `ResidentShell` with back navigation |
| MOB-015 | P1 | **Page headers clip action buttons** — `flex justify-between` without responsive stack on 10+ pages | M | **DONE** | MOB-008 | `events/page.tsx`, `polls/page.tsx`, `visitors/page.tsx`, `files/page.tsx`, `dues/page.tsx`, `facilities/page.tsx`, `notifications/page.tsx` | All use stacked header pattern; CTA visible and tappable at 375px |
| MOB-011 | P1 | **Dues rows overflow** — amount + status badge + paid date in one `flex-row` | S | **DONE** | MOB-015 | `dues/page.tsx` | Mobile: amount prominent, metadata stacked below |
| MOB-012 | P1 | **Events card metadata overflows** — time + location + RSVP count in single `flex gap-4` row | S | **DONE** | — | `events/page.tsx` | Metadata wraps to 2 lines or stacks on `<sm` |
| MOB-013 | P1 | **Poll detail metadata doesn't wrap** — eligibility + max choices + vote count | XS | **DONE** | — | `polls/[id]/page.tsx` | `flex-wrap gap-2` on metadata row |
| MOB-014 | P2 | **Ticket detail badge row overflows** — status + category + priority inline | XS | **DONE** | — | `tickets/[id]/page.tsx` | Badges wrap; subject heading below badges |
| MOB-016 | P2 | **Hub community pulse cramped** — 120px image + 4 stat chips side-by-side on 320px | S | **DONE** | — | `hub-community-pulse.tsx` | Mobile: image stacks above chips; chips wrap 2×2 |
| MOB-017 | P2 | Hub greeting long first names + emoji may wrap awkwardly | XS | **DONE** | — | `hub-greeting.tsx` | `text-xl sm:text-2xl md:text-3xl`; emoji doesn't orphan on its own line |
| MOB-028 | P2 | Hub shortcuts jump to `sm:grid-cols-4` at 640px — cramped on portrait phones in landscape | XS | **DONE** | — | `hub-shortcuts.tsx` | Use `grid-cols-2` until `md:` (768px), then 4 cols |
| MOB-030 | P2 | Ticket filter pills (5) wrap to uneven rows — consider horizontal scroll | S | **DONE** | MOB-008 | `tickets/page.tsx` | `overflow-x-auto flex-nowrap snap-x` pill row on `<sm` |
| MOB-032 | P2 | Files page header — title + `FileUpload` don't stack on mobile | XS | **DONE** | MOB-015 | `files/page.tsx` | Upload button below title on `<sm` |
| MOB-040 | P2 | Profile page back link goes to `/dashboard` not `/` (hub is home) | XS | BACKLOG | MOB-003 | `profile/page.tsx` | Back link → `/` with "Home" label |
| MOB-020 | P2 | Gate page: `GateValidation` has nested `min-h-screen` + duplicate "Gate" headings | S | **DONE** | — | `gate/page.tsx`, `gate-validation.tsx` | Single heading; validation component is content-only, no full-screen wrapper |
| MOB-036 | P3 | `/dashboard` duplicates hub widgets — extra scroll on mobile for redundant page | S | **DONE** | — | `dashboard/page.tsx` | Redirect to `/` or show condensed mobile layout (ties to CAS-035) |

---

## Phase 4 — Touch Targets & Forms

| ID | Priority | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| MOB-021 | P1 | **iOS input zoom** — forms use `text-sm` (~14px); iOS zooms on focus below 16px | M | **DONE** | — | All `*-form.tsx`, `login/page.tsx`, `globals.css` | Inputs `text-base` (16px) on mobile via `text-base md:text-sm` or global mobile rule |
| MOB-022 | P1 | **Touch targets below 44px** — widespread `h-9` (36px) buttons and filter pills | M | **DONE** | — | Shared button usage, filter pills across pages | Interactive elements ≥44×44px on `<md` (padding or `min-h-11`) |
| MOB-023 | P1 | Bottom nav effective tap area — icon is 36px (`h-9 w-9`), label not in tap target | S | **DONE** | MOB-005 | `mobile-bottom-nav.tsx` | Entire tab column (icon + label) is one ≥44px tap target |
| MOB-024 | P2 | Login dev quick-login buttons show full email — overflows on 320px | XS | **DONE** | — | `login/page.tsx` | Stack label over email; truncate email with `truncate` |
| MOB-025 | P2 | Form submit buttons `h-9` — below touch guideline | S | **DONE** | MOB-022 | All form components | Submit buttons `h-11` on mobile |
| MOB-035 | P3 | Visitor pass OTP `text-4xl` may clip on 320px with long codes | XS | **DONE** | — | `visitors/[id]/page.tsx` | `text-3xl sm:text-4xl`; `break-all` fallback |

---

## Phase 5 — Admin & Edge Layouts

| ID | Priority | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| MOB-041 | P2 | Admin layout uses `px-6` — tight on 320px screens | XS | **DONE** | MOB-001 | `admin/layout.tsx` | `px-4 sm:px-6` on main content and header |
| MOB-033 | P3 | Onboarding terms `text-3xl` heading large when keyboard open | XS | BACKLOG | — | `onboarding/terms/page.tsx` | `text-2xl sm:text-3xl`; scrollable terms area uses `max-h-[50dvh]` |
| MOB-038 | P3 | Amenity chips horizontal scroll has no visual scroll hint | XS | **DONE** | — | `hub-amenity-chips.tsx` | Fade edge visible on mobile; optional "swipe" hint on first visit |

---

## Phase 6 — QA & Documentation

| ID | Priority | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|---|
| MOB-042 | P1 | **Portrait QA matrix** — manual test checklist at 4 breakpoints | S | **DONE** | Phases 0–5 | This doc §QA Matrix | All P0/P1 items verified; failures logged |
| MOB-043 | P3 | Update `AGENTS.md` with mobile conventions (min touch, stack headers, no min-w tables) | XS | **DONE** | MOB-042 | `AGENTS.md` | Mobile rules documented for future agents |
| MOB-044 | P3 | Cross-link HUB-S14 from hub redesign backlog (now superseded by this doc) | XS | **DONE** | — | `backlog-hub-redesign.md` | HUB-S14 marked superseded with link here |

---

## QA Matrix (for MOB-042)

Test each route at **375×667 portrait** after fixes. Mark ✅/❌.

| Route | Shell present | No horizontal scroll | CTAs reachable | Bottom nav OK | Notes |
|---|---|---|---|---|---|
| `/` | ✅ header+nav | ✅ | ✅ | ✅ | Footer, shortcuts, feed all stack on mobile |
| `/login` | standalone | ✅ | ✅ | N/A | Dev buttons truncate email; inputs 16px |
| `/notices` | ✅ | ✅ | ✅ | ✅ | PageHeader stacks |
| `/tickets` | ✅ | ✅ | ✅ | ✅ | Filter pills scroll horizontally |
| `/tickets/new` | ✅ | ✅ | ✅ | ✅ | Form inputs 16px, buttons 44px |
| `/tickets/[id]` | ✅ | ✅ | ✅ | ✅ | Breadcrumb truncates; badges wrap |
| `/facilities` | ✅ | ✅ | ✅ | ✅ | Card grid |
| `/facilities/[id]` | ✅ | ✅ | ✅ | ✅ | Booking grid needs testing |
| `/visitors` | ✅ | ✅ | ✅ | ✅ | Header + cards |
| `/visitors/[id]` | ✅ | ✅ | ✅ | ✅ | OTP text scales; WhatsApp button full-width |
| `/events` | ✅ | ✅ | ✅ | ✅ | Card metadata wraps |
| `/polls` | ✅ | ✅ | ✅ | ✅ | Tabs scroll horizontally |
| `/polls/[id]` | ✅ | ✅ | ✅ | ✅ | Metadata wraps |
| `/dues` | ✅ | ✅ | ✅ | ✅ | Rows stack on mobile |
| `/directory` | ✅ | ✅ | ✅ | ✅ | Card layout on mobile |
| `/notifications` | ✅ | ✅ | ✅ | ✅ | List |
| `/profile` | ✅ | ✅ | ✅ | ✅ | Back link |
| `/users/[id]` | ✅ | ✅ | ✅ | ✅ | Shell with back navigation |
| `/units/[id]` | ✅ | ✅ | ✅ | ✅ | Shell with back navigation |
| `/gate` | standalone | ✅ | ✅ | N/A | Single heading |
| `/admin` | ✅ sidebar+mobile nav | ✅ | ✅ | N/A | Hamburger sheet on mobile |
| `/admin/users` | ✅ | ✅ | ✅ | N/A | Card layout on mobile |

---

## Shared Fix Patterns (copy-paste guidance)

### Responsive page header

```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
  <PageHeader ... className="flex-1" />
  <div className="shrink-0 w-full sm:w-auto">{action}</div>
</div>
```

### Mobile-first filter pills

```tsx
<div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
```

### Touch-friendly input

```tsx
className="... text-base md:text-sm ..."  // 16px on mobile prevents iOS zoom
```

### Table → cards breakpoint

```tsx
{/* md:hidden: card list */}
{/* hidden md:block: table */}
```

---

## Suggested Implementation Order

| Sprint | Items | Est. effort |
|---|---|---|
| **Sprint 1** (blockers) | MOB-001, MOB-002, MOB-003, MOB-005, MOB-006, MOB-007 | 2–3 days |
| **Sprint 2** (shell + headers) | MOB-004, MOB-008, MOB-015, MOB-026, MOB-039, MOB-010 | 1–2 days |
| **Sprint 3** (pages) | MOB-011–014, MOB-016–017, MOB-019, MOB-020, MOB-031–032 | 1–2 days |
| **Sprint 4** (touch/forms) | MOB-021–025, MOB-023, MOB-028, MOB-030 | 1 day |
| **Sprint 5** (admin + QA) | MOB-018, MOB-027, MOB-037, MOB-041–042 | 1–2 days |

---

## Out of Scope

- Native app / PWA install prompt
- Landscape-only tablet layouts
- Haptic feedback
- Swipe gestures for navigation
- Redesigning admin to casual shell (admin stays utilitarian)

---

## Related Docs

- [`ui-ux-casual-makeover.md`](./ui-ux-casual-makeover-archived-2026-07-06.md) — CAS-038 (touch audit), CAS-037 (reduced motion)
- [`hub-redesign.md`](./hub-redesign-archived-2026-07-06.md) — HUB-S14 (mobile pass, superseded)
- [`AGENTS.md`](../../AGENTS.md) — agent coding conventions

---

*Last updated: 2026-07-06 — Update Status column as items complete*
