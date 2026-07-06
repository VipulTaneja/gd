# UI/UX Casual Makeover — Trackable Log

> **Goal:** Shift Gulshan Dynasty from a corporate enterprise portal to a warm, resident-friendly community website — more icons, motion, playful copy, and consumer-app patterns (not admin SaaS).
>
> **Created:** 2026-07-05  
> **Primary surfaces:** `/` (hub), resident pages (`DashboardLayout`), `/login`, shared components

---

## Progress Summary

| Metric | Count |
|---|---|
| Total items | 42 |
| Done | 18 |
| In progress | 0 |
| Backlog | 24 |
| Blocked | 0 |

Update the **Status** column as work proceeds. Mark parent items done only when all dependencies are verified.

---

## Status Legend

| Status | Meaning |
|---|---|
| `BACKLOG` | Not started |
| `IN_PROGRESS` | Actively being worked on |
| `DONE` | Implemented and visually verified |
| `BLOCKED` | Waiting on dependency or product decision |

**Complexity:** `XS` (<2h) · `S` (2–4h) · `M` (4–8h) · `L` (1–2 days) · `XL` (2+ days)

---

## Design Direction (North Star)

| Enterprise (today) | Casual (target) |
|---|---|
| Dark sidebar + "Navigation" / "Administration" labels | Light top nav + bottom tab bar on mobile |
| "Dashboard", "Helpdesk", "Bookings" | "Home", "Get help", "Book a spot" |
| Playfair serif headings, dense bordered cards | Rounded sans headings, soft shadows, colorful icon tiles |
| Text-only empty states | Illustrated empty states with friendly CTAs |
| Static page loads | Staggered entrance, hover micro-interactions |
| Priority badges: `EMERGENCY`, `IN_PROGRESS` | Icon + plain language: "Urgent", "We're on it" |
| Command palette as primary discovery | Visual shortcut grid + search as secondary |

**Aesthetic risk (intentional):** Per-feature pastel icon tiles (like a lifestyle app) with a single gold accent — not another cream-and-serif template.

---

## Dependency Map

```
Phase 0 — Foundation
  CAS-001 (design tokens) ──┬──► CAS-002 (typography)
                            ├──► CAS-003 (animation utilities)
                            ├──► CAS-004 (feature color map)
                            └──► CAS-005 (microcopy constants)

Phase 1 — Shared Primitives (depends on Phase 0)
  CAS-006 (IconTile) ──► CAS-007 (Animated wrappers)
  CAS-008 (PageHeader) ──► all page refactors
  CAS-009 (FriendlyBadge) ──► CAS-010 (EmptyState v2)
  CAS-011 (SoftCard) ──► hub + list pages

Phase 2 — Navigation Shell (depends on Phase 0 + 1)
  CAS-012 (CasualHeader) ──┐
  CAS-013 (MobileBottomNav)├──► CAS-014 (ResidentShell)
  CAS-015 (HorizontalNavPills)┘         │
                                        ├──► CAS-016 (replace DashboardLayout sidebar)
                                        └──► CAS-017 (admin shell stays separate)

Phase 3 — Hub Home (depends on Phase 1–2)
  CAS-018 (HubGreeting animation + emoji)
  CAS-019 (HubShortcuts → IconTile + stagger)
  CAS-020 (HubLiveFeed → social-style cards)
  CAS-021 (HubAmenityChips → emoji + scroll snap animation)
  CAS-022 (HubCommunityPulse → stat icons)
  CAS-023 (HubHeader → match CasualHeader)

Phase 4 — Resident List Pages (depends on Phase 1–2)
  CAS-024 (notices — friendly priority labels)
  CAS-025 (events — calendar chips + icons)
  CAS-026 (polls — vote CTA styling)
  CAS-027 (tickets — "Get help" copy + status icons)
  CAS-028 (facilities — amenity hero cards)
  CAS-029 (visitors — pass card visual)
  CAS-030 (dues — payment nudge, not invoice UI)
  CAS-031 (directory — avatar grid, not data table)

Phase 5 — Forms & Auth (depends on Phase 0)
  CAS-032 (login — welcoming illustration + motion)
  CAS-033 (all forms — icon labels, softer inputs)
  CAS-034 (success toasts / inline celebrations)

Phase 6 — Dashboard Merge (depends on Phase 3–4)
  CAS-035 (retire /dashboard or redirect to /)
  CAS-036 (fold dashboard widgets into hub feed)

Phase 7 — Polish & QA (depends on all above)
  CAS-037 (reduced-motion media query pass)
  CAS-038 (mobile touch targets ≥44px audit)
  CAS-039 (Lighthouse + CLS check after animations)
  CAS-040 (guest vs resident visual QA matrix)
  CAS-041 (update ARCHITECTURE.md §9 visual language)
  CAS-042 (screenshot regression set for key routes)

**Critical path:** CAS-001 → CAS-006/008/009 → CAS-014 → CAS-019 → CAS-024–031 → CAS-037–040

---

## Phase 0 — Foundation (no dependencies)

| ID | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|
| CAS-001 | Warm casual design tokens — larger radius, softer shadows, lighter sidebar vars, feature accent slots | S | DONE | — | `src/app/globals.css` | `--radius: 0.75rem`; sidebar uses light bg not `#1a1a1a`; shadow utilities available |
| CAS-002 | Swap Playfair serif → Plus Jakarta Sans for headings (friendlier, still premium) | XS | DONE | CAS-001 | `src/app/layout.tsx` | Headings use `--font-heading`; no Playfair import |
| CAS-003 | Animation utility classes — fade-in, slide-up, stagger, hover-lift, icon-bounce; respect `prefers-reduced-motion` | S | DONE | CAS-001 | `src/app/globals.css`, `src/components/shared/animated.tsx` | Reusable `FadeIn`, `StaggerChildren` components; motion disabled when reduced-motion |
| CAS-004 | Per-feature color map (notices=amber, events=sky, polls=violet, tickets=rose, facilities=emerald, visitors=orange, dues=gold) | XS | DONE | CAS-001 | `src/lib/feature-colors.ts` | Typed map used by IconTile and badges |
| CAS-005 | Microcopy constants — replace enterprise labels app-wide | XS | DONE | — | `src/lib/microcopy.ts` | Single source: "Get help" not "Helpdesk", "What's new" not "Notices", etc. |

---

## Phase 1 — Shared Primitives

| ID | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|
| CAS-006 | `IconTile` — large rounded icon, pastel bg, label, optional badge, hover lift | S | DONE | CAS-003, CAS-004 | `src/components/shared/icon-tile.tsx` | Used by shortcuts and quick actions; 44px+ touch target |
| CAS-007 | `Animated` wrappers — `FadeIn`, `StaggerChildren`, `HoverLift` | S | DONE | CAS-003 | `src/components/shared/animated.tsx` | Children animate on mount; stagger delay configurable |
| CAS-008 | `PageHeader` — icon + friendly title + optional subtitle + action slot | S | DONE | CAS-004, CAS-005 | `src/components/shared/page-header.tsx` | Replaces raw `<h1>` on resident pages |
| CAS-009 | `FriendlyBadge` — maps status/priority enums to icon + plain label + soft color | S | DONE | CAS-004, CAS-005 | `src/components/shared/friendly-badge.tsx` | "EMERGENCY" → "Urgent" + AlertTriangle; replaces raw enum text |
| CAS-010 | `EmptyState` v2 — gentle bounce on icon, warmer copy, pill CTA | XS | DONE | CAS-003, CAS-005 | `src/components/shared/empty-state.tsx` | All list pages use shared component with feature-specific icons |
| CAS-011 | `SoftCard` — shadow-based card (no hard border), optional colored top accent | XS | DONE | CAS-001 | `src/components/shared/soft-card.tsx` | Visually distinct from current `border bg-card` pattern |

---

## Phase 2 — Navigation Shell

| ID | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|
| CAS-012 | `CasualHeader` — logo, icon nav links, notification bell, avatar; no text-heavy menu | M | DONE | CAS-004, CAS-005 | `src/components/shell/casual-header.tsx` | Sticky, blurred bg, ≤56px height; icons with tooltips on desktop |
| CAS-013 | `MobileBottomNav` — 5 tabs: Home, Book, Visitors, Help, More (sheet) | M | DONE | CAS-004, CAS-005 | `src/components/shell/mobile-bottom-nav.tsx` | Fixed bottom, safe-area padding, active state with icon fill |
| CAS-014 | `ResidentShell` — composes header + main + bottom nav; replaces sidebar pattern | L | DONE | CAS-012, CAS-013 | `src/components/shell/resident-shell.tsx` | All `DashboardLayout` pages use this shell |
| CAS-015 | `HorizontalNavPills` — scrollable icon+label pills for tablet/desktop (alternative to sidebar) | S | BACKLOG | CAS-006 | `src/components/shell/horizontal-nav-pills.tsx` | Shows below header on md+; hides when bottom nav visible |
| CAS-016 | Refactor `DashboardLayout` — remove dark sidebar, wire `ResidentShell` | L | DONE | CAS-014 | `src/components/dashboard/layout.tsx` | No `SidebarGroupLabel` "Navigation"; resident pages feel like hub |
| CAS-017 | Keep admin on separate enterprise shell (intentional contrast) | S | BACKLOG | — | `src/app/admin/layout.tsx` | Admin stays utilitarian; residents never see admin chrome |

---

## Phase 3 — Hub Home (`/`)

| ID | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|
| CAS-018 | Animated greeting with wave emoji + subtle typewriter or fade | S | DONE | CAS-003, CAS-007 | `src/components/hub/hub-greeting.tsx` | "Good evening, Priya 👋" with entrance animation |
| CAS-019 | Shortcuts grid → `IconTile` + stagger on load | M | DONE | CAS-006, CAS-007 | `src/components/hub/hub-shortcuts.tsx` | Each tile has unique pastel color; badges pulse once on mount |
| CAS-020 | Live feed → unified timeline with type icons (not 3 separate bordered boxes) | M | DONE | CAS-009, CAS-011 | `src/components/hub/hub-live-feed.tsx` | Single "What's happening" card with mixed feed items |
| CAS-021 | Amenity chips → facility-type icons (pool, gym, court) + horizontal scroll fade | S | DONE | CAS-004 | `src/components/hub/hub-amenity-chips.tsx` | Chips feel tappable; gradient fade at scroll edges |
| CAS-022 | Community pulse → stat row with lucide icons per stat | XS | DONE | CAS-011 | `src/components/hub/hub-community-pulse.tsx` | Home/Building/Leaf icons beside each chip |
| CAS-023 | Unify `HubHeader` with `CasualHeader` (DRY) | S | DONE | CAS-012 | `src/components/hub/hub-header.tsx` | Hub and inner pages share same header component |

---

## Phase 4 — Resident List & Detail Pages

| ID | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|
| CAS-024 | Notices — `PageHeader` + `FriendlyBadge` + soft cards + "Read more" expand | M | DONE | CAS-008, CAS-009, CAS-011 | `src/app/notices/page.tsx` | No raw `EMERGENCY` text; feels like a community bulletin |
| CAS-025 | Events — date chips with calendar icon, RSVP pill buttons | M | BACKLOG | CAS-008, CAS-011 | `src/app/events/page.tsx`, `src/app/events/[id]/page.tsx` | Event cards show month/day chip visually |
| CAS-026 | Polls — progress-bar preview, "Cast your vote" CTA | M | BACKLOG | CAS-008 | `src/app/polls/page.tsx`, `src/app/polls/[id]/page.tsx` | Poll list feels participatory, not bureaucratic |
| CAS-027 | Tickets — rename to "Get help", status icons, conversational empty state | M | DONE | CAS-005, CAS-008, CAS-009 | `src/app/tickets/page.tsx` | Filter pills use friendly labels; "New ticket" → "Ask for help" |
| CAS-028 | Facilities — photo-forward cards, availability dot, book CTA | M | BACKLOG | CAS-006, CAS-011 | `src/app/facilities/page.tsx`, `src/app/facilities/[id]/page.tsx` | Booking flow starts from visual amenity card |
| CAS-029 | Visitors — QR card styling, "Invite someone" CTA | M | BACKLOG | CAS-008 | `src/app/visitors/page.tsx`, `src/app/visitors/new/page.tsx` | Pass list looks like wallet cards, not table rows |
| CAS-030 | Dues — friendly nudge copy, amount as hero number, not invoice table | S | BACKLOG | CAS-008, CAS-011 | `src/app/dues/page.tsx` | "You're all caught up! 🎉" when empty |
| CAS-031 | Directory — avatar grid with tower color rings, search with icon | M | BACKLOG | CAS-008 | `src/app/directory/page.tsx` | People discovery, not employee directory |
| CAS-032b | Profile page — casual shell + avatar hero | S | BACKLOG | CAS-014 | `src/app/profile/page.tsx` | Matches resident shell aesthetic |

---

## Phase 5 — Forms & Auth

| ID | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|
| CAS-032 | Login — welcoming headline, subtle background pattern, entrance animation | M | DONE | CAS-003, CAS-005 | `src/app/login/page.tsx` | "Hey neighbor 👋" tone; not "Sign in to access your community portal" |
| CAS-033 | Form inputs — leading icons in labels, rounder inputs, focus ring animation | M | BACKLOG | CAS-001 | All `src/components/**/*-form.tsx` | Consistent icon+label pattern across 6+ forms |
| CAS-034 | Success moments — checkmark animation after submit (ticket, visitor pass, poll vote) | S | BACKLOG | CAS-003 | Form components + detail pages | Brief celebration, not silent redirect |

---

## Phase 6 — Dashboard Consolidation

| ID | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|
| CAS-035 | Redirect `/dashboard` → `/` for residents (hub is home) | S | BACKLOG | CAS-019, CAS-020 | `src/app/dashboard/page.tsx`, `next.config` or middleware | Logged-in home is hub, not duplicate dashboard |
| CAS-036 | Migrate dashboard widgets (dues, notices preview) fully into hub feed | M | BACKLOG | CAS-020, CAS-035 | `src/lib/hub-data.ts`, hub components | No duplicate data surfaces |

---

## Phase 7 — Polish, Accessibility & Docs

| ID | Item | Complexity | Status | Depends on | Files / Pointers | Acceptance Criteria |
|---|---|---|---|---|---|---|
| CAS-037 | `prefers-reduced-motion` — disable stagger, bounce, parallax | XS | BACKLOG | CAS-003 | `globals.css`, animated components | No motion for users who opt out |
| CAS-038 | Touch target audit — all interactive elements ≥44×44px on mobile | S | BACKLOG | CAS-013, CAS-016 | All shell + hub components | Manual pass on 375px viewport |
| CAS-039 | Performance — ensure animations don't hurt LCP/CLS | S | BACKLOG | CAS-003, CAS-019 | Lighthouse on `/`, `/tickets`, `/facilities` | Performance ≥85 with animations |
| CAS-040 | Guest vs resident QA matrix | S | BACKLOG | CAS-014–023 | Manual checklist | Guest sees login CTAs; resident sees badges and personal greeting |
| CAS-041 | Update `docs/ARCHITECTURE.md` — casual visual language section | XS | BACKLOG | Phase 3–4 done | `docs/ARCHITECTURE.md` | Documents tokens, nav pattern, microcopy |
| CAS-042 | Screenshot regression set (optional Playwright visual snapshots) | M | BACKLOG | CAS-040 | `e2e/visual/` or manual folder | Before/after captures for 8 key routes |

---

## Microcopy Reference (CAS-005)

| Enterprise (remove) | Casual (use) |
|---|---|
| Dashboard | Home |
| Helpdesk | Get help |
| Bookings | Book a spot |
| Notices | What's new |
| My Tickets | My requests |
| New Ticket | Ask for help |
| Directory | Neighbors |
| Visitor Pass | Invite a guest |
| Pending Dues | Payments due |
| Administration | Manage (admin only) |
| EMERGENCY | Urgent |
| IMPORTANT | Heads up |
| IN_PROGRESS | We're on it |
| RESOLVED | All sorted |
| Sign in to access your community portal | Welcome back, neighbor |

---

## Suggested Implementation Order

| Sprint | Items | Est. effort |
|---|---|---|
| **Sprint A** (foundation) | CAS-001 → CAS-005 | 1 day |
| **Sprint B** (primitives + shell) | CAS-006 → CAS-017 | 2 days |
| **Sprint C** (hub) | CAS-018 → CAS-023 | 1 day |
| **Sprint D** (resident pages) | CAS-024 → CAS-031 | 2–3 days |
| **Sprint E** (forms + merge) | CAS-032 → CAS-036 | 1–2 days |
| **Sprint F** (polish) | CAS-037 → CAS-042 | 1 day |

---

## Out of Scope (this log)

- Admin panel visual redesign (stays enterprise — CAS-017)
- Dark mode theme overhaul
- Custom illustration set / mascot character
- WebSocket real-time feed animations
- Native mobile app navigation patterns (swipe gestures)

---

## Related Docs

- [`backlog-hub-redesign.md`](./backlog-hub-redesign.md) — hub layout (mostly done; CAS-018–023 extend it)
- [`260704-ui-ux-backlog.md`](./260704-ui-ux-backlog.md) — code audit items (done)
- [`../DESIGN-PROFILES.md`](../DESIGN-PROFILES.md) — profile page linking conventions (unchanged)

---

*Last updated: 2026-07-05 — Update Status column as items complete*
