# FAQ — Implementation Backlog

> **Location:** Development tracking — see also [Specification index](../specification/README.md) and [Functional Spec §5.19](../specification/functional-spec.md).
>
> **Goal:** A public **Frequently Asked Questions** area anyone can read (guests + residents), organized into **sections** with multiple Q&A entries each.
>
> **Created:** 2026-07-07
> **Last updated:** 2026-07-07 (feature complete)

---

## Progress Summary

| Metric | Count |
|---|---|
| Total items | 45 |
| Done | 41 |
| Remaining | 0 |
| On hold | 2 |
| Deferred | 1 |
| Cancelled | 1 |

**Status:** Feature complete 2026-07-07. On hold / deferred items in `hold-backlog.md`.

---

## Product Decisions (locked 2026-07-07)

| # | Question | Choice |
|---|---|---|
| Q1 | Committee title matching | Fixed enum (DesignationTitle) |
| Q2 | Logged-in /faq layout | Dual routes: /faq (guest) → /faq/app (resident) |
| Q3 | In-page search | Yes, P1 |
| Q4 | Who can edit FAQ? | All active committee designations + Admin + Super Admin |
| Q5 | Publish workflow | Self-publish |
| Q6 | Hub integration | Static link/tile |
| Q7 | Route naming | Keep /faq/app |
| Q8 | Hub tile target | Session-aware |
| Q9 | Leader hub link | Yes — "Edit FAQ" on /leader for editors |
| Q10 | Empty hub tile | Hide until ≥1 published FAQ |

---

## Files Implemented

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | FaqSection, FaqItem models |
| `src/lib/faq.ts` | Data access |
| `src/lib/faq-auth.ts` | RBAC (canManageFaq) |
| `src/app/faq/page.tsx` | Public read (guest) |
| `src/app/faq/app/page.tsx` | Resident read (DashboardLayout) |
| `src/app/faq/manage/page.tsx` | Editor CRUD |
| `src/components/faq/` | Accordion, section/item forms |
| `src/app/api/faq/` | Public + manage API routes |
| `src/lib/faq-metadata.ts` | Open Graph metadata + FAQPage JSON-LD |
| `src/lib/faq-rate-limit.ts` | Write rate limit (30/min per editor) |
| `prisma/seed-faq.ts` | Dev seed |

---

*41 items archived to `archive/faq-archived-2026-07-07.md` · 4 items in `hold-backlog.md`*
