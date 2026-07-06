# Community Hub Landing Redesign — Archived Items

> **Source:** `backlog-hub-redesign.md`
> **Archived:** 2026-07-06
> **Count:** 14 completed items

---

## Phase 1 — Data Layer

| ID | Description | Complexity | Status |
|---|---|---|---|
| HUB-S1 | Create `src/lib/hub-data.ts` — parallel fetch helpers for guest vs resident hub data | M | DONE |
| HUB-S2 | Define TypeScript types for hub payload (`HubData`, `HubShortcut`, `HubFeedItem`) | XS | DONE |

## Phase 2 — Layout Shell

| ID | Description | Complexity | Status |
|---|---|---|---|
| HUB-S3 | Create `CommunityHub` layout shell — single-viewport grid | M | DONE |
| HUB-S4 | Build `HubHeader` — compact nav: logo, site name, Notices link, Login button or avatar menu | S | DONE |
| HUB-S5 | Build `HubGreeting` — time-of-day greeting + resident line (name, tower, unit via `UnitLink`) | S | DONE |
| HUB-S6 | Build `HubFooter` — single-row strip: RWA, Privacy, Terms, Contact RWA trigger, copyright | XS | DONE |

## Phase 3 — Interactive Widgets

| ID | Description | Complexity | Status |
|---|---|---|---|
| HUB-S7 | Build `HubShortcuts` — 8-tile grid with auth-aware hrefs and live badge counts | M | DONE |
| HUB-S8 | Build `HubAmenityChips` — horizontal scroll of bookable facilities | S | DONE |
| HUB-S9 | Build `HubCommunityPulse` — compact photo + stat chips + optional weather | M | DONE |
| HUB-S10 | Build `HubLiveFeed` — tabbed or stacked feed: notices, events, polls | L | DONE |

## Phase 4 — Contact & Page Integration

| ID | Description | Complexity | Status |
|---|---|---|---|
| HUB-S11 | Move contact form to `ContactRwaDialog` (shadcn Dialog/Sheet) | S | DONE |
| HUB-S12 | Rewrite `src/app/page.tsx` — server component composing full hub | M | DONE |

## Phase 5 — Cleanup, QA & Docs

| ID | Description | Complexity | Status |
|---|---|---|---|
| HUB-S13 | Remove old landing sections from home page; deprecate unused components | S | DONE |
| HUB-S14 | Mobile responsive pass — superseded by `mobile-responsiveness-backlog.md` | M | DONE |
