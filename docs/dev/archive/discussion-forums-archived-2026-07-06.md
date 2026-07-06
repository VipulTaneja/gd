# Discussion Forums — Archived Items

> **Source:** `backlog-discussion-forums.md`
> **Archived:** 2026-07-06
> **Count:** 23 completed items

---

## Phase 0 — Discovery & Decisions

| ID | Description | Priority | Complexity | Status |
|---|---|---|---|---|
| FORUM-001 | Stakeholder workshop: confirm forum goals, tower-specific vs society-only, buy/sell category | P0 | S | DONE |
| FORUM-002 | Integration decision: native module (Option A) vs Discourse SSO (Option B) | P0 | S | DONE |
| FORUM-003 | Moderation policy doc: report SLA, ban rules, editable window, profanity handling | P0 | S | DONE |

## Phase 1 — Data Layer & API

| ID | Description | Priority | Complexity | Status |
|---|---|---|---|---|
| FORUM-010 | Prisma schema: `Forum`, `ForumThread`, `ForumPost`, `ForumReport` | P0 | M | DONE |
| FORUM-011 | Migration + `prisma generate` | P0 | S | DONE |
| FORUM-012 | Seed default forums (`general`, `suggestions`, `announcements`) | P0 | S | DONE |
| FORUM-013 | `src/lib/forums/rbac.ts` — `canReadForum`, `canPost`, `canModerate` | P0 | M | DONE |
| FORUM-014 | API: `GET/POST /api/forums`, `GET /api/forums/[slug]/threads` | P0 | M | DONE |
| FORUM-015 | API: `POST /api/forums/threads`, `GET /api/forums/threads/[id]` | P0 | M | DONE |
| FORUM-016 | API: `POST /api/forums/threads/[id]/posts` (reply) | P0 | M | DONE |
| FORUM-017 | API: `PATCH/DELETE` own post (15 min edit window) | P1 | S | DONE |
| FORUM-018 | Add `NotificationType` values + migration | P1 | S | DONE |

## Phase 2 — Resident UI

| ID | Description | Priority | Complexity | Status |
|---|---|---|---|---|
| FORUM-020 | Page `/forums` — category cards with recent thread preview | P0 | M | DONE |
| FORUM-021 | Page `/forums/[slug]` — thread list with pinned section | P0 | M | DONE |
| FORUM-022 | Page `/forums/[slug]/[threadId]` — thread detail + reply list | P0 | L | DONE |
| FORUM-023 | Create thread form — `/forums/[slug]/new` | P0 | M | DONE |
| FORUM-024 | Reply composer component — sticky on mobile | P0 | M | DONE |
| FORUM-025 | Nav: add Forums to `mobile-bottom-nav` More sheet + resident sidebar | P0 | S | DONE |
| FORUM-027 | Empty states + microcopy | P1 | XS | DONE |
| FORUM-028 | Guest `/forums` landing — sign-in CTA | P1 | S | DONE |

## Phase 4 — Moderation & Safety

| ID | Description | Priority | Complexity | Status |
|---|---|---|---|---|
| FORUM-040 | Report post — `POST /api/forums/posts/[id]/report` | P0 | M | DONE |
| FORUM-041 | Admin queue `/admin/forums/reports` | P0 | M | DONE |
| FORUM-042 | Admin actions: hide post, lock thread, pin thread, delete | P0 | M | DONE |
