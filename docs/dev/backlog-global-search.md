# Global Search — Implementation Backlog

> **Goal:** One search entry point (Cmd+K / header / mobile sheet) that finds **anything a resident is allowed to see**.
>
> **Created:** 2026-07-06
> **Last updated:** 2026-07-06

---

## Progress Summary

| Metric | Count |
|---|---|
| Total items | 32 |
| Done | 22 |
| Remaining | 10 |
| Blocked | 0 |

---

## Remaining Items

### Phase 1 — API Coverage (3 items)

| ID | Description | Priority | Complexity | Status |
|---|---|---|---|---|
| SRCH-014 | Forum posts — search post body; return thread title as subtitle | P1 | Medium | Remaining |
| SRCH-016 | File vault — search name; respect sub-community membership | P1 | Medium | Remaining |
| SRCH-018 | Lost & found — search title, description; active only | P2 | Small | Remaining |

### Phase 2 — UI (1 item)

| ID | Description | Priority | Complexity | Status |
|---|---|---|---|---|
| SRCH-037 | Dedicated `/search` page — full results list, shareable URL | P2 | Medium | Remaining |

### Phase 3 — Ranking & Polish (4 items)

| ID | Description | Priority | Complexity | Status |
|---|---|---|---|---|
| SRCH-040 | Relevance scoring: exact match > prefix > contains; emergency boosted | P1 | Medium | Remaining |
| SRCH-042 | Recent searches — localStorage last 5 queries | P2 | Small | Remaining |
| SRCH-043 | Type filter chips in dialog (All · People · Units · Updates · Events) | P2 | Medium | Remaining |
| SRCH-044 | Highlight matched substring in result title | P2 | Small | Remaining |

### Phase 4 — Performance (1 item)

| ID | Description | Priority | Complexity | Status |
|---|---|---|---|---|
| SRCH-050 | Add PostgreSQL indexes: User(name), Unit(unitNumber), Notice(title), ForumThread(title) | P1 | Small | Remaining |

### Phase 5 — Admin (1 item)

| ID | Description | Priority | Complexity | Status |
|---|---|---|---|---|
| SRCH-060 | Admin search mode: include deactivated users, all tickets, hidden threads | P2 | Medium | Remaining |

---

## Files Implemented

| File | Change |
|---|---|
| `src/lib/search/types.ts` | Created — types, stripHtml, normalizeUnit, navigation shortcuts |
| `src/app/api/search/route.ts` | Rewritten — auth, RBAC, 11 entity types, parallelized queries |
| `src/components/shared/global-search-dialog.tsx` | Created — unified UI with keyboard nav, feature icons, priority badges |
| `src/components/shell/casual-header.tsx` | Updated — mounted GlobalSearchDialog with ⌘K |

---

*22 items archived to `archive/global-search-archived-2026-07-06.md` · 10 items remaining*
