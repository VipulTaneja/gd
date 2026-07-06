# UI/UX Casual Makeover — Archived Items

> **Source:** `ui-ux-casual-makeover-log.md`
> **Archived:** 2026-07-06
> **Count:** 24 completed items

---

## Phase 0 — Foundation

| ID | Item | Complexity | Status |
|---|---|---|---|
| CAS-001 | Warm casual design tokens — larger radius, softer shadows, lighter sidebar vars, feature accent slots | S | DONE |
| CAS-002 | Swap Playfair serif → Plus Jakarta Sans for headings (friendlier, still premium) | XS | DONE |
| CAS-003 | Animation utility classes — fade-in, slide-up, stagger, hover-lift, icon-bounce; respect `prefers-reduced-motion` | S | DONE |
| CAS-004 | Per-feature color map (notices=amber, events=sky, polls=violet, tickets=rose, facilities=emerald, visitors=orange, dues=gold) | XS | DONE |
| CAS-005 | Microcopy constants — replace enterprise labels app-wide | XS | DONE |

## Phase 1 — Shared Primitives

| ID | Item | Complexity | Status |
|---|---|---|---|
| CAS-006 | `IconTile` — large rounded icon, pastel bg, label, optional badge, hover lift | S | DONE |
| CAS-007 | `Animated` wrappers — `FadeIn`, `StaggerChildren`, `HoverLift` | S | DONE |
| CAS-008 | `PageHeader` — icon + friendly title + optional subtitle + action slot | S | DONE |
| CAS-009 | `FriendlyBadge` — maps status/priority enums to icon + plain label + soft color | S | DONE |
| CAS-010 | `EmptyState` v2 — gentle bounce on icon, warmer copy, pill CTA | XS | DONE |
| CAS-011 | `SoftCard` — shadow-based card (no hard border), optional colored top accent | XS | DONE |

## Phase 2 — Navigation Shell

| ID | Item | Complexity | Status |
|---|---|---|---|
| CAS-012 | `CasualHeader` — logo, icon nav links, notification bell, avatar; no text-heavy menu | M | DONE |
| CAS-013 | `MobileBottomNav` — 5 tabs: Home, Book, Visitors, Help, More (sheet) | M | DONE |
| CAS-014 | `ResidentShell` — composes header + main + bottom nav; replaces sidebar pattern | L | DONE |
| CAS-016 | Refactor `DashboardLayout` — remove dark sidebar, wire `ResidentShell` | L | DONE |

## Phase 3 — Hub Home

| ID | Item | Complexity | Status |
|---|---|---|---|
| CAS-018 | Animated greeting with wave emoji + subtle typewriter or fade | S | DONE |
| CAS-019 | Shortcuts grid → `IconTile` + stagger on load | M | DONE |
| CAS-020 | Live feed → unified timeline with type icons (not 3 separate bordered boxes) | M | DONE |
| CAS-021 | Amenity chips → facility-type icons (pool, gym, court) + horizontal scroll fade | S | DONE |
| CAS-022 | Community pulse → stat row with lucide icons per stat | XS | DONE |
| CAS-023 | Unify `HubHeader` with `CasualHeader` (DRY) | S | DONE |

## Phase 4 — Resident List & Detail Pages

| ID | Item | Complexity | Status |
|---|---|---|---|
| CAS-024 | Notices — `PageHeader` + `FriendlyBadge` + soft cards + "Read more" expand | M | DONE |
| CAS-027 | Tickets — rename to "Get help", status icons, conversational empty state | M | DONE |

## Phase 5 — Forms & Auth

| ID | Item | Complexity | Status |
|---|---|---|---|
| CAS-032 | Login — welcoming headline, subtle background pattern, entrance animation | M | DONE |
