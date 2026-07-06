# Global Search — Archived Items

> **Source:** `docs/dev/backlog-global-search.md`
> **Archived:** 2026-07-06
> **Count:** 22 completed items

---

## Phase 0 — Foundation (4 items)

| ID | Description | Status |
|---|---|---|
| SRCH-001 | Add `src/lib/search/` module: types, `stripHtmlForSearch()`, unit query normalizer | DONE |
| SRCH-002 | Require `auth()` on `/api/search`; return `401` for guests | DONE |
| SRCH-003 | Rate-limit `/api/search` (100 req/min per user) | DONE |
| SRCH-004 | Document search privacy rules | DONE |

## Phase 1 — API Coverage (10 items)

| ID | Description | Status |
|---|---|---|
| SRCH-010 | Notices — search title + body; filter expired; tower scoping | DONE |
| SRCH-011 | Events — search title, description, location; community scoping | DONE |
| SRCH-012 | Polls — search title, description; open polls only | DONE |
| SRCH-013 | Forum threads — search title + body; exclude hidden | DONE |
| SRCH-015 | Facilities — search name, description, location | DONE |
| SRCH-017 | Sub-communities — search name, description | DONE |
| SRCH-019 | Tickets — own only for residents; admin sees all | DONE |
| SRCH-020 | Users — exclude email from results | DONE |
| SRCH-021 | Units — normalize input (B14 → B-1402) | DONE |
| SRCH-022 | Unified `groups[]` response shape | DONE |

## Phase 2 — UI Unification (7 items)

| ID | Description | Status |
|---|---|---|
| SRCH-030 | Create `GlobalSearchDialog` — unified component | DONE |
| SRCH-031 | Mount in `CasualHeader` with ⌘K shortcut | DONE |
| SRCH-032 | Update `MobileSearch` to use shared dialog | DONE |
| SRCH-033 | Feature icons + FriendlyBadge for notice priority | DONE |
| SRCH-034 | Group headers use microcopy labels | DONE |
| SRCH-035 | Loading, empty, error states | DONE |
| SRCH-036 | Keyboard navigation (↑↓, Enter, Esc) | DONE |

## Phase 3 — Ranking & Polish (1 item)

| ID | Description | Status |
|---|---|---|
| SRCH-041 | Navigation shortcuts ("help" → /tickets) | DONE |

## Phase 4 — Performance (1 item)

| ID | Description | Status |
|---|---|---|
| SRCH-053 | Parallelize queries with Promise.all | DONE |

---

## Files Implemented

| File | Change |
|---|---|
| `src/lib/search/types.ts` | Created — types, stripHtml, normalizeUnit, navigation shortcuts |
| `src/app/api/search/route.ts` | Rewritten — auth, RBAC, 11 entity types, parallelized queries |
| `src/components/shared/global-search-dialog.tsx` | Created — unified UI with keyboard nav, feature icons, priority badges |
| `src/components/shell/casual-header.tsx` | Updated — mounted GlobalSearchDialog with ⌘K |
