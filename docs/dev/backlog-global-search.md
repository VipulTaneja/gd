# Global Search — Implementation Backlog

> **Goal:** One search entry point (Cmd+K / header / mobile sheet) that finds **anything a resident is allowed to see**.
>
> **Created:** 2026-07-06
> **Last updated:** 2026-07-07

---

## Progress Summary

| Metric | Count |
|---|---|
| Total items | 46 |
| Done | 45 |
| Deferred | 1 |

---

## Deferred (1 item)

| ID | Description | Priority | Complexity | Status |
|---|---|---|---|---|
| SRCH-037 | Dedicated `/search` page — full results list, shareable URL | P3 | Medium | Deferred |

---

## Searchable Entities (all complete)

| Entity | Link to | Search by |
|---|---|---|
| Users | `/users/[id]` | name |
| Units | `/units/[unitNumber]` | unitNumber, block |
| Notices | `/notices` | title, body |
| Events | `/events/[id]` | title, description, location |
| Polls | `/polls/[id]` | title, description |
| Forum threads | `/forums/[slug]/threads/[id]` | title, body |
| Forum posts | thread + `#post` | body |
| Facilities | `/facilities/[id]` | name, description, location |
| Sub-communities | `/communities/[id]` | name, description |
| Tickets | `/tickets/[id]` | subject, description (+ closed 90 days) |
| Navigation shortcuts | various | keywords |
| Staff registry | `/staff/[id]` | name (fuzzy) |
| Important contacts | `/contacts/[id]` | typeOfService, name, category |
| FAQ | `/faq#section-item-slug` | section title, item question |
| Pet | `/units/[unitNumber]` | name, breed (own unit only) |
| Vehicle | `/units/[unitNumber]` | registration, make/model (own unit only) |
| File vault | download / vault page | name |
| Lost & found | lost-found detail | title, description |

---

*45 items archived to `archive/global-search-archived-2026-07-07.md` · 1 item deferred*
