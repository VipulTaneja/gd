# Staff Registry & Important Contacts — Archived Items

> **Source:** `docs/dev/backlog-staff-registry.md`
> **Archived:** 2026-07-07
> **Count:** 78 items (48 completed + 20 contacts completed + 8 skipped + 2 cancelled)

---

## Staff — Completed (48 items)

### Phase 1 — Unified staff identity (38 items)

| ID | Description | Status |
|---|---|---|
| STAFF-010 | Prisma models + enums; migration | DONE |
| STAFF-011 | Migration script: DomesticHelp → new tables | DONE |
| STAFF-012 | src/lib/staff.ts — CRUD, phone dedupe, aggregate rating | DONE |
| STAFF-013 | API: POST /api/staff — create person + first association | DONE |
| STAFF-014 | API: /api/staff/[id]/associations POST/PATCH | DONE |
| STAFF-015 | RBAC: approved resident + active unit member | DONE |
| STAFF-016 | StaffAssociateForm — search-first + create-new | DONE |
| STAFF-017 | /visitors?tab=help — third tab | DONE |
| STAFF-018 | Unit profile "Household staff" section | DONE |
| STAFF-019 | Pass generator: one daily pass per StaffPerson | DONE |
| STAFF-055 | API GET /api/staff/search?q= | DONE |
| STAFF-056 | Search UI — debounced typeahead | DONE |
| STAFF-057 | Associate flow: pick unit, role, recurrence | DONE |
| STAFF-058 | Block duplicate active association | DONE |
| STAFF-059 | StaffLink component | DONE |
| STAFF-060 | Prisma StaffReview | DONE |
| STAFF-061 | API GET/POST/PATCH/DELETE reviews | DONE |
| STAFF-062 | StaffReviewForm — stars + comment | DONE |
| STAFF-063 | Resident page /staff/[id] | DONE |
| STAFF-064 | "Add to my unit" CTA on staff profile | DONE |
| STAFF-065 | Avg rating on profile, search, help tab | DONE |
| STAFF-066 | Review list — UserLink author, paginated | DONE |
| STAFF-067 | RBAC: approved resident; staff must have ≥1 association | DONE |
| STAFF-070 | Document staff profile in design-profiles.md | DONE |
| STAFF-072 | Help tab: show which unit each association belongs to | DONE |
| STAFF-073 | /staff/* — login required; approved resident for search/associate/review | DONE |
| STAFF-074 | Visitor pass detail links to /staff/[id] when FK present | DONE |
| STAFF-079 | Cron route /api/cron/generate-staff-passes | DONE |
| STAFF-080 | Exempt staff passes from BR-07 resident pass limit | DONE |
| STAFF-081 | Refactor getTodayStaff() + gate validate: resolve all units | DONE |
| STAFF-082 | Gate validation notifies all active members of linked units | DONE |
| STAFF-083 | Enforce BR-STAFF-08 max 5 active unit associations | DONE |
| STAFF-084 | Profile + API: show ended associations as "Previously at [unit]" | DONE |
| STAFF-086 | API GET /api/staff/[id] — profile, associations, aggregate rating | DONE |
| STAFF-087 | API GET /api/staff?unitIds= — list staff for caller's unit(s) | DONE |
| STAFF-088 | Help tab: End association action | DONE |
| STAFF-089 | microcopy.ts — regular help tab, associate flow, review labels | DONE |
| STAFF-092 | Audit: log associate + end | DONE |
| STAFF-094 | Associate form + API: filter to UNIT-scoped roles only | DONE |
| STAFF-095 | Gate validate API: include staff phone in guard-only response | DONE |

### Phase 2 — Society staff & admin (5 items)

| ID | Description | Status |
|---|---|---|
| STAFF-026 | Admin /admin/staff list + filters | DONE |
| STAFF-027 | Admin /admin/staff/[id] detail | DONE |
| STAFF-029 | Audit log: STAFF_PERSON_CREATED, STAFF_ASSOCIATION_* | DONE |
| STAFF-068 | Admin hide/unhide review; recalc aggregate | DONE |
| STAFF-069 | Audit: STAFF_REVIEW_CREATED, STAFF_REVIEW_HIDDEN | DONE |

### Phase 3 — Compliance (2 items)

| ID | Description | Status |
|---|---|---|
| STAFF-036 | Gate "Today's expected" panel cards | DONE |
| STAFF-040 | End association → auto-cancel future recurring passes | DONE |

### Phase 5 — Notifications & polish (1 item)

| ID | Description | Status |
|---|---|---|
| STAFF-053 | Update functional-spec.md §5.11 | DONE |

---

## Important Contacts — Completed (20 items)

### Phase 1 — Detail pages + reviews (19 items)

| ID | Description | Status |
|---|---|---|
| CONT-010 | Prisma: ContactReview + relations; ImportantContact.createdById | DONE |
| CONT-011 | src/lib/contact-reviews.ts — aggregate, batch aggregates | DONE |
| CONT-012 | API GET /api/contacts/[id] — contact + avgRating + reviewable | DONE |
| CONT-013 | API review CRUD + paginated GET; rate limit | DONE |
| CONT-014 | Page /contacts/[id] — header, call CTA, reviews | DONE |
| CONT-015 | ContactsList — Link to detail; remove tel: + inline edit; show ★ avg | DONE |
| CONT-016 | ContactReviewForm — edit/delete own; StarRatingInput | DONE |
| CONT-017 | ContactReviewList — UserLink, paginated, EmptyState | DONE |
| CONT-018 | RBAC: reviewable = category !== "Internal Intercom" | DONE |
| CONT-019 | ContactLink component | DONE |
| CONT-020 | microcopy.ts — contact review labels | DONE |
| CONT-021 | Login required; reviews need approved resident | DONE |
| CONT-022 | POST /api/contacts — approved resident only; set createdById | DONE |
| CONT-023 | Cross-link banner → /visitors?tab=help | DONE |
| CONT-024 | Document ContactLink in design-profiles.md | DONE |
| CONT-032 | Update functional-spec.md — vendor directory + reviews | DONE |
| CONT-033 | contacts/page.tsx — batch avgRating/reviewCount | DONE |
| CONT-034 | PATCH /api/contacts — approved resident (own) or admin | DONE |
| CONT-035 | Shared StarRatingInput in src/components/shared/ | DONE |

### Phase 2 — Admin, search, polish (1 item)

| ID | Description | Status |
|---|---|---|
| CONT-036 | Detail page edit for creator/admin (moved from list) | DONE |

---

## Staff — Skipped (8 items)

| ID | Description | Status |
|---|---|---|
| STAFF-001 | Document target schema in architecture.md | SKIPPED |
| STAFF-002 | Normalize helpType → enum | SKIPPED |
| STAFF-003 | Wire DomesticHelpForm on /visitors?tab=help | SKIPPED |
| STAFF-004 | List resident's DomesticHelp on help tab | SKIPPED |
| STAFF-005 | PATCH /api/domestic-help/[id] | SKIPPED |
| STAFF-006 | Cron /api/cron/generate-help-passes | SKIPPED |
| STAFF-007 | Add domesticHelpId FK on VisitorPass | SKIPPED |
| STAFF-008 | Gate panel: show helpType + photo | SKIPPED |

## Staff — Cancelled (1 item)

| ID | Description | Notes |
|---|---|---|
| STAFF-050 | ~~Notify resident on pass validation~~ | Superseded by STAFF-082 |

## Contacts — Cancelled (1 item)

| ID | Description | Notes |
|---|---|---|
| CONT-029 | ~~Admin-only create~~ | CONT-Q2 decided: approved residents can create |
