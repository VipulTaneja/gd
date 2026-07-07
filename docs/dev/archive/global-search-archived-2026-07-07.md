# Global Search — Archived Items

> **Source:** `docs/dev/backlog-global-search.md`
> **Archived:** 2026-07-07
> **Count:** 45 completed items

---

## Phase 0 — Foundation (7 items)

| ID | Description | Status |
|---|---|---|
| SRCH-001 | Add `src/lib/search/` module: types, stripHtml, normalizeUnit | DONE |
| SRCH-002 | Require auth on `/api/search` | DONE |
| SRCH-003 | Rate-limit `/api/search` | DONE |
| SRCH-004 | Document search privacy rules | DONE |
| SRCH-073 | Update SearchResultType — add pet, vehicle, lost_found | DONE |
| SRCH-074 | Update navigation shortcuts — staff, contacts, FAQ keywords | DONE |
| SRCH-075 | Verify feature-colors.ts keys | DONE |

## Phase 1 — API Coverage (14 items)

| ID | Description | Status |
|---|---|---|
| SRCH-010 | Notices — title, body, tower scoping | DONE |
| SRCH-011 | Events — title, description, location | DONE |
| SRCH-012 | Polls — title, description | DONE |
| SRCH-013 | Forum threads — title, body | DONE |
| SRCH-014 | Forum posts — body, link to thread | DONE |
| SRCH-015 | Facilities — name, description, location | DONE |
| SRCH-016 | File vault — name, sub-community membership | DONE |
| SRCH-017 | Sub-communities — name, description | DONE |
| SRCH-018 | Lost & found — title, description | DONE |
| SRCH-019 | Tickets — subject, description + closed 90 days | DONE |
| SRCH-020 | Users — exclude email | DONE |
| SRCH-021 | Units — normalize input | DONE |
| SRCH-022 | Unified groups[] response | DONE |

## Phase 2 — UI (8 items)

| ID | Description | Status |
|---|---|---|
| SRCH-030 | GlobalSearchDialog — unified component | DONE |
| SRCH-031 | Mount in CasualHeader with ⌘K | DONE |
| SRCH-032 | Replace MobileSearch with dialog | DONE |
| SRCH-033 | Feature icons + FriendlyBadge | DONE |
| SRCH-034 | Group headers use microcopy labels | DONE |
| SRCH-035 | Loading, empty, error states | DONE |
| SRCH-036 | Keyboard navigation | DONE |

## Phase 3 — Ranking (1 item)

| ID | Description | Status |
|---|---|---|
| SRCH-041 | Navigation shortcuts | DONE |

## Phase 4 — Performance (2 items)

| ID | Description | Status |
|---|---|---|
| SRCH-050 | PostgreSQL indexes for all entities | DONE |
| SRCH-053 | Parallelize queries with Promise.all | DONE |

## New Entities (7 items)

| ID | Description | Status |
|---|---|---|
| SRCH-070 | Staff registry — name search | DONE |
| SRCH-071 | Important contacts — typeOfService, name, category | DONE |
| SRCH-072 | FAQ — section title + item question | DONE |
| SRCH-076 | Pet — name, breed (own unit only) | DONE |
| SRCH-077 | Vehicle — registration, make/model (own unit only) | DONE |
| SRCH-078 | Closed tickets — own from last 90 days | DONE |
