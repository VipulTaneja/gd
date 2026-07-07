# Staff Registry & Important Contacts — Implementation Backlog

> **Location:** Development tracking — see also [Specification index](../specification/README.md), [Functional Spec §5.11–5.12](../specification/functional-spec.md), and [Roles & Permissions §3–4](../specification/roles-and-permissions.md).
>
> **Goal:** Two complementary reputation systems for Gulshan Dynasty:
> 1. **Staff registry** — individual non-resident people with unit/society associations, gate passes, and reviews
> 2. **Important contacts** — vendor businesses and service lines with detail pages and community reviews
>
> **Created:** 2026-07-07
> **Last updated:** 2026-07-07

---

## Progress Summary

| Metric | Staff | Contacts | Combined |
|---|---|---|---|
| Total items | 83 | 30 | **113** |
| Done | 48 | 20 | **68** |
| Remaining | 35 | 10 | **45** |
| On hold | 21 | 7 | **28** |
| Deferred | 4 | 3 | **7** |
| Cancelled | 1 | 1 | **2** |
| Skipped | 8 | 0 | **8** |

---

## Remaining Items

All remaining items (on hold + deferred) have been moved to `hold-backlog.md` under "Staff Registry & Contacts Deferred Items".

---

## Key Flows

### Staff — associate existing maid (search-first)
```
Resident → Regular help → Add → Search by name/phone → Match found? → Staff profile → Associate with my unit
```

### Staff — leave a review
```
Resident opens /staff/id → Approved? → View profile + reviews → Already reviewed? → Submit/Edit/Delete
```

### Contacts — review a vendor
```
Resident → Contacts → vendor card → /contacts/id → Approved? → View detail + reviews → Submit/Edit/Delete
```

---

## Product Decisions (locked 2026-07-07)

**Staff (22 decisions):** Q1–Q22 all resolved — see §12.1 in archived file.
**Contacts (11 decisions):** CONT-Q1–Q11 all resolved — see §12.2 in archived file.

---

## Files Implemented

**Staff:**
- `prisma/schema.prisma` — StaffPerson, StaffAssociation, StaffReview models
- `src/lib/staff.ts` — CRUD, search, aggregate rating
- `src/app/staff/[id]/page.tsx` — Staff profile
- `src/components/staff/` — StaffLink, search, review form/list
- `src/app/api/staff/` — Search, profile, associations, reviews

**Contacts:**
- `src/app/contacts/[id]/page.tsx` — Contact detail
- `src/components/contacts/` — ContactLink, review form/list
- `src/app/api/contacts/[id]/` — Profile + reviews
- `src/components/shared/star-rating-input.tsx` — Shared with staff

---

*78 items archived to `archive/staff-registry-archived-2026-07-07.md` · 35 items deferred to `hold-backlog.md`*
