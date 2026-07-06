# Discussion Forums — Product & Engineering Backlog

> **Goal:** Add resident discussion forums inside the Gulshan Dynasty portal — scoped threads, replies, moderation, and notifications — without maintaining a separate forum product where possible.
>
> **Created:** 2026-07-06  
> **Replaces / supersedes:** `P2-12` and `IMP-503` in `docs/hold-backlog.md` (real-time chat deferrals) for **async forum** scope only. Live chat remains out of scope for v1.
>
> **Related:** `docs/FUNCTIONAL-SPEC.md` §4 (Sub-communities), `docs/DESIGN-PROFILES.md`, `docs/tracking/ui-ux-casual-makeover-log.md`, existing `TicketComment` pattern in `src/app/tickets/[id]/`

---

## Progress Summary

| Metric | Count |
|---|---|
| Total items | 48 |
| Done | 25 |
| In progress | 0 |
| Backlog | 23 |
| Blocked | 0 |

Update **Status** as work proceeds.

---

## Status Legend

| Status | Meaning |
|---|---|
| `BACKLOG` | Not started |
| `IN_PROGRESS` | Actively being worked on |
| `DONE` | Implemented and verified |
| `BLOCKED` | Waiting on stakeholder decision or dependency |

**Priority:** `P0` (must-have for launch) · `P1` (expected for v1) · `P2` (polish / phase 2) · `P3` (nice-to-have)

**Complexity:** `XS` (<2h) · `S` (2–4h) · `M` (4–8h) · `L` (1–2 days) · `XL` (3+ days)

---

## 1. Problem Statement

Residents currently use **WhatsApp groups** for informal discussion. The portal has **notices** (broadcast, one-way), **polls** (structured votes), and **tickets** (private support threads) — but no place for **open, searchable, moderated community conversation**.

Forums should:

- Feel native to the casual resident UI (not a bolted-on iframe).
- Respect existing **auth, approval status, and RBAC**.
- Support **society-wide** and **sub-community** (Sports Club, etc.) scopes.
- Be moderatable by RWA admins without a separate admin panel login.

---

## 2. Integration Options (Free / Open Source)

| Option | What it is | Cost | Fit for this repo | Verdict |
|---|---|---|---|---|
| **A — Native module (recommended)** | Prisma models + Next.js pages; assemble UI from free libraries | $0 | Best with Vercel + Neon + R2; reuses auth, notifications, `UserLink`, R2 uploads | **Recommended** |
| **B — Discourse (self-hosted)** | Mature OSS forum (Ruby); SSO via DiscourseConnect | $0 software; needs VM | Second stack (not Vercel serverless); strong moderation OOTB | Fallback if RWA wants full forum with minimal dev |
| **C — NodeBB** | Node.js forum | $0 | Requires MongoDB + Redis — new data stores | Poor fit |
| **D — Flarum** | PHP forum | $0 | Separate PHP host | Poor fit |
| **E — iframe embed (Discourse/others)** | Embed external forum in `/forums` | Varies | Fast but weak mobile UX, broken shell/nav | Not recommended |
| **F — SaaS (TalkJS, Stream, etc.)** | Hosted chat/forum SDKs | Free tiers limited; data off-platform | Quick prototype; vendor lock-in | Defer unless speed > control |

**Decision (default for this backlog):** **Option A — Native module** using free libraries below. Revisit Option B only if stakeholder explicitly wants Discourse feature parity without 4–6 weeks of dev.

---

## 3. Free Libraries & Components to Use

Do **not** build editor, sanitization, or avatar UI from scratch — use existing OSS:

| Need | Library | License | Notes |
|---|---|---|---|
| Rich text editor | [`@tiptap/react`](https://tiptap.dev) + starter kit | MIT | Bold, lists, links, mentions extension (optional v2) |
| Markdown fallback / render | `react-markdown` + `remark-gfm` | MIT | Lighter alternative to TipTap for v1 |
| HTML sanitization | `isomorphic-dompurify` | MIT | Sanitize rendered post body |
| Forms / validation | `react-hook-form` + `zod` | MIT | Match existing patterns |
| Relative timestamps | `date-fns` or `Intl.RelativeTimeFormat` | MIT | "2h ago" on posts |
| Optimistic UI (optional) | `@tanstack/react-query` | MIT | Reply posting UX |
| Profanity filter (basic) | `bad-words` | MIT | Client + server check; not sole moderation layer |
| Image attachments | Existing R2 presigned flow | — | Reuse `src/lib/minio.ts` + `/api/files/upload` |
| UI shell | `ResidentShell`, `PageHeader`, `SoftCard`, `UserLink` | — | Casual makeover components |
| Search (v1) | PostgreSQL `ILIKE` / `tsvector` | — | Extend `/api/search` in v2 |
| Pagination URL state | `nuqs` (optional) | MIT | `?page=2` on thread lists |

**Explicitly out of scope for v1 libraries:** WebSockets, Redis, Elasticsearch, separate search service.

---

## 4. Product Scope

### 4.1 In scope — Forum v1

| Capability | Detail |
|---|---|
| Forum spaces | Society-wide categories + one forum per `SubCommunity` |
| Threads | Title, body, author, pinned/locked flags, view count |
| Replies | Flat chronological replies; optional `replyToPostId` for quote context |
| Auth | Approved residents only; guests see marketing CTA on `/forums` |
| Roles | Author edit/delete own post (15 min window); admins moderate anytime |
| Attachments | Up to 3 images per post via R2 |
| Notifications | In-app: reply to your thread, reply to your comment, thread pinned |
| Moderation | Report post, admin hide/delete, lock thread, pin thread |
| Audit | Moderation actions logged to existing `AuditLog` |
| Mobile | Card layout, bottom nav entry, touch-friendly reply composer |

### 4.2 Out of scope — Forum v1 (phase 2+)

| Item | Rationale |
|---|---|
| Real-time live chat | Deferred as `IMP-503`; different infra |
| Anonymous posting | Society accountability; conflicts with profiles |
| Direct messages between residents | `P2-08` deferred |
| Push / SMS for every reply | Use in-app + optional daily digest later |
| AI moderation | Manual + keyword filter sufficient for 204 homes |
| Marketplace / buy-sell forum | `IMP-502` deferred; separate category later |
| Email reply-by-mail | High complexity |

### 4.3 Proposed default categories (society-wide)

| Slug | Name | Who can post | Notes |
|---|---|---|---|
| `general` | General Discussion | Approved residents | Default |
| `suggestions` | Suggestions & Feedback | Approved residents | RWA reads, may pin official responses |
| `tower-a` | Tower A | Tower A residents | Filter by `Unit.block` |
| `tower-b` | Tower B | Tower B residents | |
| `tower-c` | Tower C | Tower C residents | |
| `announcements` | Official Responses | Admins only | Residents read-only; complements notices |

*Tower forums are optional for v1 — stakeholder decision in FORUM-003.*

---

## 5. Data Model (Prisma — draft)

New models (names tentative):

```
Forum          — id, slug, name, description, scope (GLOBAL | SUB_COMMUNITY), subCommunityId?, 
                 isReadOnly, sortOrder, isArchived
ForumThread    — id, forumId, authorId, title, body, status (OPEN | LOCKED | HIDDEN), isPinned,
                 viewCount, lastActivityAt, createdAt, updatedAt
ForumPost      — id, threadId, authorId, body, replyToPostId?, isHidden, editedAt, createdAt
ForumReaction  — id, postId, userId, emoji (👍❤️😂) — P2
ForumReport    — id, postId, reporterId, reason, status (OPEN | RESOLVED), resolvedById?
ForumSubscription — userId, threadId — notify on new replies — P2
```

**Reuse existing:**

- `User`, `SubCommunity`, `CommunityMembership` for access control
- `Notification` + new enum values: `FORUM_REPLY`, `FORUM_MENTION`, `FORUM_MODERATION`
- `AuditLog` for admin actions

**Indexes:** `(forumId, lastActivityAt DESC)`, `(threadId, createdAt ASC)`, full-text on `ForumThread.title` (P2).

---

## 6. Access Control Matrix

| Action | Guest | Pending resident | Approved resident | Sub-community member | Admin |
|---|---|---|---|---|---|
| View public forum list | Landing CTA only | Yes (read-only banner) | Yes | Yes | Yes |
| Read threads | No | Yes | Yes | Yes if scoped | Yes |
| Create thread | No | No | Yes (global) | Yes (sub-community) | Yes |
| Reply | No | No | Yes | Yes if member | Yes |
| Pin / lock / hide | No | No | No | Sub-community admin only* | Yes |
| Report post | No | No | Yes | Yes | Yes |

\*Sub-community admin = `CommunityMembership.role === ADMIN` for that group.

---

## 7. Dependency Map

```
Phase 0 — Decisions
  FORUM-001 (requirements) ──► FORUM-003 (moderation policy)
  FORUM-002 (build vs embed) ──► all implementation phases

Phase 1 — Foundation
  FORUM-010 (schema) ──► FORUM-011 (migration) ──► FORUM-012 (seed categories)
                    └──► FORUM-013 (RBAC helpers) ──► FORUM-014–017 (APIs)

Phase 2 — Core UI
  FORUM-020 (forum list) ──► FORUM-021 (thread list) ──► FORUM-022 (thread detail)
  FORUM-023 (create thread) ──► FORUM-024 (reply composer)
  FORUM-025 (nav integration) — can parallel after FORUM-020

Phase 3 — Sub-communities
  FORUM-030 (sub-community tab) — depends on FORUM-020 + existing `/communities/[id]`

Phase 4 — Moderation
  FORUM-040 (report flow) ──► FORUM-041 (admin queue)
  FORUM-042 (pin/lock/hide) — depends on FORUM-013

Phase 5 — Engagement
  FORUM-050 (notifications) — depends on FORUM-014
  FORUM-051 (hub feed) — optional polish

Phase 6 — Polish & QA
  FORUM-060–063
```

---

## 8. Backlog Items

### Phase 0 — Discovery & Decisions

| ID | Description | Priority | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|---|
| FORUM-001 | Stakeholder workshop: confirm forum goals, tower-specific vs society-only, buy/sell category | P0 | S | **DONE** | 30-min RWA checklist; document in this file §4.3 | Default decisions applied: society-wide only, markdown, both moderate, residents post |
| FORUM-002 | **Integration decision:** native module (Option A) vs Discourse SSO (Option B) | P0 | S | **DONE** | If B chosen, replace Phase 1–2 with SSO + iframe/redirect spike | Default: Option A |
| FORUM-003 | Moderation policy doc: report SLA, ban rules, editable window, profanity handling | P0 | S | **DONE** | `docs/FORUM-MODERATION.md`; RWA sign-off | Blocks FORUM-040 |
| FORUM-004 | UX wireframes: forum list, thread detail, mobile composer (align casual makeover) | P1 | M | BACKLOG | Extend `ui-ux-casual-makeover-log.md` or Figma; reuse `PageHeader` + `SoftCard` | |

### Phase 1 — Data Layer & API

| ID | Description | Priority | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|---|
| FORUM-010 | Prisma schema: `Forum`, `ForumThread`, `ForumPost`, `ForumReport` | P0 | M | **DONE** | `prisma/schema.prisma`; follow `HelpTicket` + `TicketComment` naming | |
| FORUM-011 | Migration + `prisma generate` | P0 | S | **DONE** | `npm run db:migrate` | |
| FORUM-012 | Seed default forums (`general`, `suggestions`, `announcements`) | P0 | S | **DONE** | `prisma/seed.ts` or `prisma/seed-forums.ts` | |
| FORUM-013 | `src/lib/forums/rbac.ts` — `canReadForum`, `canPost`, `canModerate` | P0 | M | **DONE** | Check `approvalStatus`, `globalRole`, `CommunityMembership`, tower block | Mirror `requireAdmin()` in ticket actions |
| FORUM-014 | API: `GET/POST /api/forums`, `GET /api/forums/[slug]/threads` | P0 | M | **DONE** | Paginated thread list; sort by `lastActivityAt` | |
| FORUM-015 | API: `POST /api/forums/threads`, `GET /api/forums/threads/[id]` | P0 | M | **DONE** | Include posts + authors; increment `viewCount` debounced | |
| FORUM-016 | API: `POST /api/forums/threads/[id]/posts` (reply) | P0 | M | **DONE** | Validate thread not locked; sanitize body | |
| FORUM-017 | API: `PATCH/DELETE` own post (15 min edit window) | P1 | S | **DONE** | Server-side `createdAt` check | |
| FORUM-018 | Add `NotificationType` values + migration | P1 | S | **DONE** | `FORUM_REPLY`, `FORUM_MENTION`, `FORUM_MODERATION` | |
| FORUM-019 | Server actions alternative to REST (optional consolidation) | P2 | M | BACKLOG | Prefer server actions if matching tickets pattern | Decision in FORUM-014 |

### Phase 2 — Resident UI

| ID | Description | Priority | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|---|
| FORUM-020 | Page `/forums` — category cards with recent thread preview | P0 | M | **DONE** | `ResidentShell`; `featureColors.forums` entry | |
| FORUM-021 | Page `/forums/[slug]` — thread list with pinned section | P0 | M | **DONE** | Search/filter input (title ILIKE); pagination | |
| FORUM-022 | Page `/forums/[slug]/[threadId]` — thread detail + reply list | P0 | L | **DONE** | Clone layout from `tickets/[id]/page.tsx`; `UserLink` on every author | |
| FORUM-023 | Create thread form — `/forums/[slug]/new` | P0 | M | **DONE** | TipTap or textarea + markdown preview; zod max lengths | Title 120 chars, body 10k |
| FORUM-024 | Reply composer component — sticky on mobile | P0 | M | **DONE** | `components/forums/reply-composer.tsx`; min 44px submit | |
| FORUM-025 | Nav: add Forums to `mobile-bottom-nav` More sheet + resident sidebar | P0 | S | **DONE** | `feature-colors.ts` key `forums`; icon `MessagesSquare` | |
| FORUM-026 | Hub live feed: show latest 3 forum threads | P2 | S | BACKLOG | `hub-live-feed.tsx` new item type | |
| FORUM-027 | Empty states + microcopy | P1 | XS | **DONE** | `src/lib/microcopy.ts` | |
| FORUM-028 | Guest `/forums` landing — sign-in CTA | P1 | S | **DONE** | Middleware: `/forums` protected like `/directory` | Update `middleware.ts` |
| FORUM-029 | Image attachments in posts (R2) | P1 | M | BACKLOG | Reuse presigned upload; max 3 images; render in post body | |

### Phase 3 — Sub-Community Integration

| ID | Description | Priority | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|---|
| FORUM-030 | Auto-create `Forum` row when `SubCommunity` created | P1 | S | BACKLOG | Hook in admin community create action | |
| FORUM-031 | Tab "Discussions" on `/communities/[id]` page | P1 | M | BACKLOG | Filter threads by `subCommunityId` | |
| FORUM-032 | Sub-community admin: pin/lock threads in their forum only | P1 | M | BACKLOG | `canModerate(forum, user)` | |
| FORUM-033 | Join-to-post gate: must be `CommunityMembership` member | P1 | S | BACKLOG | Clear error if not member | |

### Phase 4 — Moderation & Safety

| ID | Description | Priority | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|---|
| FORUM-040 | Report post — `POST /api/forums/posts/[id]/report` | P0 | M | **DONE** | `ForumReport` model; rate limit 5/day/user | |
| FORUM-041 | Admin queue `/admin/forums/reports` | P0 | M | **DONE** | Table: reporter, excerpt, resolve/dismiss | |
| FORUM-042 | Admin actions: hide post, lock thread, pin thread, delete | P0 | M | **DONE** | `src/app/admin/forums/actions.ts`; audit log entries | |
| FORUM-043 | Profanity filter on create/reply (server-side) | P1 | S | BACKLOG | `bad-words` + custom society blocklist | |
| FORUM-044 | Rate limits: max 10 threads/day, 50 replies/day per user | P1 | S | BACKLOG | Extend `middleware.ts` pattern or in-route check | |
| FORUM-045 | Block re-posting after user deactivated | P1 | XS | BACKLOG | Check `user.isActive` in RBAC | |

### Phase 5 — Engagement (Post-v1)

| ID | Description | Priority | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|---|
| FORUM-050 | Notifications: reply to thread author + reply-to comment author | P1 | M | BACKLOG | `createNotification` in post create action | |
| FORUM-051 | Thread subscription toggle ("Follow thread") | P2 | M | BACKLOG | `ForumSubscription` model | |
| FORUM-052 | Reactions (👍 ❤️ 😂) on posts | P2 | M | BACKLOG | `ForumReaction` unique `(postId, userId, emoji)` | |
| FORUM-053 | @mention parsing + notification | P2 | L | BACKLOG | TipTap mention extension; parse `userId` tokens | |
| FORUM-054 | Weekly digest email of top threads | P3 | L | BACKLOG | Resend batch; ties to `E14-S4` deferred | |

### Phase 6 — Search, Polish & QA

| ID | Description | Priority | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|---|
| FORUM-060 | Extend `/api/search` to include forum threads | P2 | M | BACKLOG | Title ILIKE; return `/forums/...` links | |
| FORUM-061 | SEO / metadata for public forum landing | P3 | XS | BACKLOG | `generateMetadata` on `/forums` | |
| FORUM-062 | Mobile QA pass (375px): composer, long threads, attachments | P1 | M | BACKLOG | Cross-ref `mobile-responsiveness-backlog.md` | |
| FORUM-063 | E2E smoke test script: create thread → reply → report | P1 | M | BACKLOG | Playwright or manual test plan in `docs/TESTING.md` | |

### Phase 7 — Discourse Fallback Track (only if FORUM-002 = Option B)

| ID | Description | Priority | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|---|
| FORUM-070 | Spike: Discourse Docker on staging + DiscourseConnect SSO | P2 | L | BLOCKED | `docs/deploy-discourse.md`; map NextAuth user → Discourse | Only if Option B |
| FORUM-071 | Embed or deep-link Discourse categories per sub-community | P2 | M | BLOCKED | iframe vs subdomain `forum.gulshandynasty.com` | |

---

## 9. Suggested Implementation Order (Sprints)

| Sprint | Items | Outcome |
|---|---|---|
| **Sprint F1** (1 week) | FORUM-001–004, 010–013, 012 | Schema live, RBAC tested, policy signed off |
| **Sprint F2** (1 week) | FORUM-014–018, 020–024, 028 | Residents can browse, create threads, reply |
| **Sprint F3** (1 week) | FORUM-025, 029–033, 040–045 | Sub-community forums + moderation |
| **Sprint F4** (3–4 days) | FORUM-050, 027, 062–063 | Notifications + QA ship |

**Estimated total:** ~3–4 weeks for one developer (Forum v1, Option A).

---

## 10. Stakeholder Decision Log

| ID | Question | Options | Default if no answer |
|---|---|---|---|
| FORUM-D1 | Tower-specific forums in v1? | Yes / No / Phase 2 | No — society-wide only for v1 |
| FORUM-D2 | Rich text (TipTap) or plain markdown v1? | TipTap / Markdown / Plain textarea | Markdown |
| FORUM-D3 | Who moderates sub-community forums? | RWA only / Sub-community admin / Both | Both |
| FORUM-D4 | Allow tenants to create threads? | Yes / Read-only / Same as owners | Yes (approved residents) |

---

## 11. Success Metrics (90 days post-launch)

| Metric | Target |
|---|---|
| Weekly active forum users | ≥ 15% of approved residents |
| Threads created per week | ≥ 10 society-wide |
| Median report resolution time | < 24 hours |
| WhatsApp "official topic" duplicate posts | Qualitative decrease (survey) |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Low adoption vs WhatsApp | Pin important threads; RWA seeds first topics; hub feed surfacing |
| Moderation overload | Report queue + rate limits; start with 3 categories only |
| Toxic / political arguments | Lock threads; clear moderation policy; admins trained |
| Storage cost (images) | 3 images/post limit; 5 MB each; R2 lifecycle rules |
| Build scope creep | Strict v1 out-of-scope list (§4.2); defer reactions/mentions |

---

*Last updated: 2026-07-06 | Owner: Product / Engineering*
