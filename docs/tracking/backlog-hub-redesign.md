# Backlog — Community Hub Landing Redesign

> **Goal:** Replace the scroll-heavy, brand-style landing page with a **single-viewport Community Hub** — interactive, resident-first, same page for guests and logged-in users.
>
> **Design reference:** Community Hub plan (conversation 2026-07-04). Update [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) §9.2 when complete.
>
> **Primary file:** [`src/app/page.tsx`](../../src/app/page.tsx)

---

## Progress Summary

| Metric | Count |
|---|---|
| Total items | 17 |
| Done | 12 |
| In progress | 0 |
| Backlog | 5 |
| Blocked | 0 |

**Target:** One viewport on desktop (1280×800), no 80vh hero, live widgets for residents.

---

## Status Legend

| Status | Meaning |
|---|---|
| `BACKLOG` | Not started |
| `IN_PROGRESS` | Actively being worked on |
| `DONE` | Implemented and verified |
| `BLOCKED` | Waiting on dependency or decision |

**Complexity:** `XS` (<2h) · `S` (2–4h) · `M` (4–8h) · `L` (1–2 days)

---

## Dependency Map

```
HUB-S1 (hub-data) ─────────────────────────────────────────────┐
       │                                                          │
       ├──► HUB-S10 (live feed)                                   │
       ├──► HUB-S7  (shortcuts + badges)                          │
       └──► HUB-S12 (page.tsx rewrite) ◄── all UI components      │
                │                                                  │
HUB-S3 (shell) ─┼──► HUB-S4 (header)                             │
                ├──► HUB-S5 (greeting)                             │
                ├──► HUB-S6 (footer)                             │
                ├──► HUB-S7, S8, S9, S10, S11                    │
                │                                                  │
HUB-S12 ──► HUB-S13 (remove old sections) ──► HUB-S14–S16 (QA)   │
                └──► HUB-S17 (docs)                              │
```

**Critical path:** S1 → S3 → S7/S10 → S12 → S14

---

## Phase 1 — Data Layer (foundation)

| ID | Description | Complexity | Status | Depends on | Implementation Pointers | Acceptance Criteria | Remarks |
|---|---|---|---|---|---|---|---|
| HUB-S1 | Create `src/lib/hub-data.ts` — parallel fetch helpers for guest vs resident hub data | M | DONE | — | Export `getHubData(sessionUserId?)`; guest: global notices (no tower filter), upcoming events, active polls; resident: tower-filtered notices, badge counts (open tickets, pending dues, unread notifications), user name + primary unit | Returns typed object; no N+1 queries; reuse patterns from `dashboard/page.tsx` | |
| HUB-S2 | Define TypeScript types for hub payload (`HubData`, `HubShortcut`, `HubFeedItem`) | XS | DONE | — | `src/types/hub.ts` or colocated in `hub-data.ts`; strict types for feed items and shortcut config | Types used by all hub components without `any` | |

---

## Phase 2 — Layout Shell

| ID | Description | Complexity | Status | Depends on | Implementation Pointers | Acceptance Criteria | Remarks |
|---|---|---|---|---|---|---|---|
| HUB-S3 | Create `CommunityHub` layout shell — single-viewport grid (`min-h-screen`, no page scroll on desktop) | M | DONE | S2 | `src/components/hub/community-hub.tsx`; CSS grid: header / greeting / main (2-col) / footer; warm bg `#faf8f5` | Desktop 1280×800: all sections visible without scrolling main page | |
| HUB-S4 | Build `HubHeader` — compact nav: logo, site name, Notices link, Login button or avatar menu | S | DONE | S3 | `hub-header.tsx`; if session: avatar dropdown → Profile, Dashboard, Logout; if guest: "Resident Login" → `/login` | Header height ~56px; works on mobile (hamburger optional) | |
| HUB-S5 | Build `HubGreeting` — time-of-day greeting + resident line (name, tower, unit via `UnitLink`) | S | DONE | S1, S3 | `hub-greeting.tsx`; guest: "Welcome to Gulshan Dynasty"; resident: "Good evening, {firstName} · Tower {block} · {unitNumber}" | Uses `UnitLink` for unit; no marketing copy | |
| HUB-S6 | Build `HubFooter` — single-row strip: RWA, Privacy, Terms, Contact RWA trigger, copyright | XS | DONE | S3 | `hub-footer.tsx`; ~40px height; links only, no 4-column marketing footer | Contact opens dialog (S11), not inline form | |

---

## Phase 3 — Interactive Widgets

| ID | Description | Complexity | Status | Depends on | Implementation Pointers | Acceptance Criteria | Remarks |
|---|---|---|---|---|---|---|---|
| HUB-S7 | Build `HubShortcuts` — 8-tile grid with auth-aware hrefs and live badge counts | M | DONE | S1, S3 | `hub-shortcuts.tsx`; tiles: Book Amenity, Visitor Pass, Raise Ticket, My Dues, Notices, Events, Polls, Directory; guest → `/login?callbackUrl=...`; hover lift + gold ring | All 8 tiles navigate correctly for guest and resident; badges show when count > 0 | |
| HUB-S8 | Build `HubAmenityChips` — horizontal scroll of bookable facilities | S | DONE | S3 | `hub-amenity-chips.tsx`; fetch facilities from DB or static seed list; chip → `/facilities` or `/facilities/[id]`; scroll-snap on mobile | No full 7-card grid; single row only | |
| HUB-S9 | Build `HubCommunityPulse` — compact photo + stat chips + optional weather | M | DONE | S3 | `hub-community-pulse.tsx`; static image `overview.webp` (~120px); chips: "204 homes · 3 towers · IGBC Platinum"; weather via Open-Meteo API for Sector 144 (28.5, 77.4), cache 30min | Replaces 80vh carousel + gallery; no autoplay carousel | Weather deferred to future |
| HUB-S10 | Build `HubLiveFeed` — tabbed or stacked feed: notices, events, polls | L | DONE | S1, S3 | `hub-live-feed.tsx`; top 3 notices, 2 events, 1 poll; priority badges; "View all →" links; empty states per T8 in ARCHITECTURE | Live data from DB; skeleton while loading | |

---

## Phase 4 — Contact & Page Integration

| ID | Description | Complexity | Status | Depends on | Implementation Pointers | Acceptance Criteria | Remarks |
|---|---|---|---|---|---|---|---|
| HUB-S11 | Move contact form to `ContactRwaDialog` (shadcn Dialog/Sheet) | S | DONE | S6 | `contact-rwa-dialog.tsx`; reuse form fields from `landing/contact.tsx`; POST to `/api/enquiry`; trigger from footer "Contact RWA" | Form not on page scroll; submit works as before | |
| HUB-S12 | Rewrite `src/app/page.tsx` — server component composing full hub | M | DONE | S1, S3–S11 | `auth()` + `getHubData()`; render `CommunityHub` with all child components; `export const dynamic = "force-dynamic"` | `/` renders hub for guest and resident; no old section imports | |

---

## Phase 5 — Cleanup, QA & Docs

| ID | Description | Complexity | Status | Depends on | Implementation Pointers | Acceptance Criteria | Remarks |
|---|---|---|---|---|---|---|---|
| HUB-S13 | Remove old landing sections from home page; deprecate unused components | S | DONE | S12 | Stop importing `HeroSection`, `CommunitySection`, `AmenitiesSection`, `ContactSection` from `page.tsx`; optionally delete or keep `src/components/landing/*` for reference | `page.tsx` only uses `hub/*` components | Old components kept in landing/ |
| HUB-S14 | ~~Mobile responsive pass~~ **SUPERSEDED** by `mobile-responsiveness-backlog.md` (MOB-001–MOB-042) | M | DONE | S12 | See mobile-responsiveness-backlog.md | All 42 items completed | |
| HUB-S15 | Guest vs resident QA matrix — verify all shortcut hrefs, badges, and feed visibility | S | BACKLOG | S12 | Manual checklist: guest sees login CTAs; resident sees counts; tower-filtered notices for resident | All 8 shortcuts behave per routing table in this doc | |
| HUB-S16 | Performance check — Lighthouse ≥90 Performance; remove heavy carousel assets from LCP | S | BACKLOG | S13 | Run Lighthouse on `/`; ensure hero carousel not loaded; `next/image` on pulse photo only | Performance score ≥90 | |
| HUB-S17 | Update `docs/ARCHITECTURE.md` §9.2 — replace landing wireframe with Community Hub layout | XS | BACKLOG | S12 | Document single-viewport hub sections; note contact dialog; resident vs guest behavior | ARCHITECTURE matches implemented hub | |

---

## Shortcut Routing Reference (for HUB-S7 / S15)

| Tile | Guest href | Resident href |
|---|---|---|
| Book Amenity | `/login?callbackUrl=/facilities` | `/facilities` |
| Visitor Pass | `/login?callbackUrl=/visitors/new` | `/visitors/new` |
| Raise Ticket | `/login?callbackUrl=/tickets/new` | `/tickets/new` |
| My Dues | `/login?callbackUrl=/dues` | `/dues` |
| Notices | `/login?callbackUrl=/notices` | `/notices` |
| Events | `/login?callbackUrl=/events` | `/events` |
| Polls | `/login?callbackUrl=/polls` | `/polls` |
| Directory | `/login?callbackUrl=/directory` | `/directory` |

---

## Badge Count Sources (for HUB-S1 / S7)

| Badge | Query |
|---|---|
| Open tickets | `HelpTicket` where `userId` and `status IN (OPEN, IN_PROGRESS)` |
| Pending dues | `Due` where user's unit(s) and `status = PENDING` |
| Unread notifications | `Notification` where `userId` and `isRead = false` |
| Active polls | `Poll` where open now (optional badge on Polls tile) |

---

## Out of Scope (this backlog)

- Auto-redirect logged-in users from `/` to `/dashboard`
- Merging `/dashboard` into `/` entirely
- WebSocket live updates on hub
- Redesigning `/login` page

---

## Suggested Implementation Order

1. **Day 1:** HUB-S1, S2, S3, S4, S6  
2. **Day 2:** HUB-S5, S7, S9  
3. **Day 3:** HUB-S10, S8, S11  
4. **Day 4:** HUB-S12, S13, S14, S15  
5. **Day 5:** HUB-S16, S17  

---

*Created: 2026-07-04 | Track status in Remarks column as work proceeds*
