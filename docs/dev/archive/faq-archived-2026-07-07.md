# FAQ — Archived Items

> **Source:** `docs/dev/backlog-faq.md`
> **Archived:** 2026-07-07
> **Count:** 41 completed items

---

## Phase 0 — Decisions (5 items)

| ID | Description | Status |
|---|---|---|
| FAQ-001 | Write access: Admin, Super Admin, any active committee designation | DONE |
| FAQ-002 | Public `/faq` without login | DONE |
| FAQ-003 | Cascade delete section with confirm | DONE |
| FAQ-004 | Add FAQ epic to product-roadmap.md | DONE |
| FAQ-005 | Document models in architecture.md | DONE |

## Phase 1 — Schema & lib (6 items)

| ID | Description | Status |
|---|---|---|
| FAQ-010 | Prisma: FaqSection + FaqItem; migration; User relations | DONE |
| FAQ-011 | src/lib/faq.ts — public list, admin list, CRUD, reorder, slug helpers | DONE |
| FAQ-012 | src/lib/faq-auth.ts — canManageFaq(), requireFaqEditor() | DONE |
| FAQ-013 | Route /faq/manage — not under /admin; shared manage page | DONE |
| FAQ-014 | Slug helpers — section slug on create; item slug from question | DONE |
| FAQ-015 | DesignationTitle enum; migrate Designation.title; committee API validation | DONE |

## Phase 2 — API (6 items)

| ID | Description | Status |
|---|---|---|
| FAQ-020 | GET /api/faq — public published tree; no auth | DONE |
| FAQ-021 | GET /api/faq/manage — all sections + drafts; requireFaqEditor | DONE |
| FAQ-022 | POST/PATCH/DELETE /api/faq/sections — RBAC + audit + slug rules | DONE |
| FAQ-023 | POST/PATCH/DELETE /api/faq/items — validateRichTextBody on answer | DONE |
| FAQ-024 | PATCH /api/faq/reorder — batch sortOrder for sections or items | DONE |
| FAQ-029 | Rate limit write routes (~30/min/user) | DONE |

## Phase 3 — Public UI (11 items)

| ID | Description | Status |
|---|---|---|
| FAQ-026 | Accordion UI — install shadcn Accordion or native details | DONE |
| FAQ-030 | Page /faq — guest layout; redirect logged-in → /faq/app | DONE |
| FAQ-031 | FaqAccordion — sections + items; RichTextContent; hash scroll | DONE |
| FAQ-033 | Open Graph + optional FAQPage JSON-LD | DONE |
| FAQ-034 | Nav: login footer, More menu, hub tile, admin sidebar, leader hub | DONE |
| FAQ-035 | Mobile QA — accordion, images, search box | DONE |
| FAQ-036 | In-page client search — filter questions/sections as user types | DONE |
| FAQ-057 | Redirect helper: /faq → /faq/app preserves #hash | DONE |
| FAQ-058 | Item anchor slugs + scroll-on-load from window.location.hash | DONE |
| FAQ-059 | Page /faq/app — DashboardLayout; embed FaqAccordion; Edit FAQ CTA | DONE |
| FAQ-063 | feature-colors.ts — add faq key; use in PageHeader on /faq/app | DONE |

## Phase 4 — Manage UI (7 items)

| ID | Description | Status |
|---|---|---|
| FAQ-040 | Page /faq/manage — section list; canManageFaq guard | DONE |
| FAQ-041 | FaqSectionForm — create/edit title, description, publish | DONE |
| FAQ-042 | FaqItemForm — question + RichTextEditor; publish toggle | DONE |
| FAQ-043 | Delete confirm dialogs (section shows item count) | DONE |
| FAQ-044 | Reorder UI — up/down buttons | DONE |
| FAQ-046 | Audit log: FAQ_SECTION_*, FAQ_ITEM_* via logAction | DONE |
| FAQ-064 | Leader hub (/leader) — Edit FAQ link when canManageFaq | DONE |

## Phase 5 — Uploads, seed, docs (6 items)

| ID | Description | Status |
|---|---|---|
| FAQ-050 | prisma/seed-faq.ts — 4–5 sections, ~15 published FAQs | DONE |
| FAQ-051 | microcopy.ts — public + manage labels, empty states | DONE |
| FAQ-052 | Update functional-spec.md — FAQ module | DONE |
| FAQ-053 | Update roles-and-permissions.md | DONE |
| FAQ-054 | package.json → db:seed:faq; wire in dev seed docs | DONE |
| FAQ-055 | FAQ image uploads: namespace=faq on /api/files/upload; canManageFaq required | DONE |
