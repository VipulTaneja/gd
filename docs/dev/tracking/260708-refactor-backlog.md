# Code Audit Backlog — Refactoring & Shared Components
_Generated: 2026-07-08 · Focus: Refactoring opportunities, shared component extraction, API/lib consolidation, security gaps_
_Continues [`260708-ui-ux-backlog.md`](./260708-ui-ux-backlog.md) (AUD-021–154)_
_Sprints 1–3 archived: [`260708-refactor-backlog-archived-2026-07-08.md`](../archive/260708-refactor-backlog-archived-2026-07-08.md) (AUD-155–214, 29 done)_
_Legend: **Impact** H/M/L · **Complexity** H/M/L · **Status** Discovered | In Progress | Done_
_Validated in code: 2026-07-08_

---

## Progress summary

| Bucket | Count | IDs | Status |
|--------|-------|-----|--------|
| **Sprint 1–3** (archived) | 29 | AUD-155–214 subset | [Done → archive](../archive/260708-refactor-backlog-archived-2026-07-08.md) |
| **Done** (pending next archive) | 1 | AUD-186 | Code verified 2026-07-08 |
| **In Progress** | 3 | AUD-172, AUD-203, AUD-209 | Partial completion |
| **Sprint 4 — Page & UX consistency** | 15 | AUD-159–166, AUD-177–178, AUD-180, AUD-184, AUD-191, AUD-205–207 | Open |
| **Sprint 5 — Dead code & lib DRY** | 12 | AUD-170–171, AUD-173, AUD-195–196, AUD-201–202, AUD-204, AUD-206, AUD-208, AUD-210, AUD-213 | Open |
| **Total in file** | **31** | AUD-159–214 (open subset) | |

---

## Shared component extraction roadmap

Sprints 1–3 extractions are **done** (see archive). Remaining work uses these primitives:

| Priority | Component / module | Status |
|----------|-------------------|--------|
| `ConfirmDialog`, `InlineAlert`, `useJsonMutation`, `ReorderButtons`, `SearchInput`, `FilterPillRow`, `ApproveRejectButtons`, `RejectBookingDialog` | Done |
| `requireAdminApi()`, `upload-config`, `canManageCommunityContent()` | Done |

---

## Batch fix patterns (remaining)

| Pattern | Items | Approach |
|---------|-------|----------|
| `PageHeader` + `EmptyState` adoption | AUD-159–166, AUD-191 | Add missing `FeatureKey` entries first (profile, packages, gate) |
| `FriendlyBadge` / semantic badges | AUD-163 | Extend badge map; batch-replace inline color maps |
| `Breadcrumb` on detail pages | AUD-164–166, AUD-184 | Mirror tickets/forums pattern |
| Dead code removal | AUD-170–173 | Delete `landing/` folder or wire public route |
| Lib DRY | AUD-195–210, AUD-213 | FAQ guards, review aggregates, cron wrapper, naming |

---

## Items

### Sprint 4 — Page & UX consistency

| ID | Sprint | Area | Description | Complexity | Impact | Pointers to Solve | Status |
|----|--------|------|-------------|------------|--------|-------------------|--------|
| AUD-159 | Sprint 4 | Frontend | `packages/page.tsx` — hand-rolled h1, inline empty state, raw status pills; no `PageHeader` / `EmptyState` / `FriendlyBadge` / `SoftCard`. | Low | Medium | Add `packages` to `feature-colors.ts` + `microcopy.ts`; mirror `dues/page.tsx` conventions. | Discovered |
| AUD-160 | Sprint 4 | Frontend | `notifications/page.tsx:33-36` hand-rolled h1 despite `feature-colors.notifications`; `notification-list.tsx:92-95` inline empty text. | Low | Medium | Adopt `PageHeader feature="notifications"` + `EmptyState`. | Discovered |
| AUD-161 | Sprint 4 | Frontend | `files/page.tsx:44-72` — no `PageHeader` or `EmptyState`. | Low | Medium | Add `files` feature key + microcopy; use shared header/empty components. | Discovered |
| AUD-162 | Sprint 4 | Frontend | `profile/page.tsx:63` uses `feature="directory"` for "My Profile" — wrong icon/color (same class as AUD-026 on staff detail). | Low | Low | Add `"profile"` to `FeatureKey`. | Discovered |
| AUD-163 | Sprint 4 | Frontend | `tickets/[id]/page.tsx:14-62` local `statusStyles` + raw enum text; list page still uses legacy `StatusBadge` (AUD-028). | Low | Medium | Use `FriendlyBadge` on detail page; complete AUD-028 migration. | Discovered |
| AUD-164 | Sprint 4 | Frontend | `events/[id]/page.tsx` — no `PageHeader`/`Breadcrumb`; `← Events` link; raw cards; RSVP as colored buttons not badges. | Medium | Low | Match forums detail pattern (`PageHeader` + `Breadcrumb`). | Discovered |
| AUD-165 | Sprint 4 | Frontend | `polls/[id]/page.tsx` — no `PageHeader`/`Breadcrumb`; hardcoded Anonymous/Resolution pills at `:60-65`. | Low | Low | Add header + breadcrumb; shared badge variants. | Discovered |
| AUD-166 | Sprint 4 | Frontend | `facilities/[id]/page.tsx` — no `PageHeader`; `← Facilities`; one-off purple leader pills; raw cards not `SoftCard`. | Low | Medium | Add `PageHeader feature="facilities"` + `Breadcrumb`; semantic leader badge. | Discovered |
| AUD-177 | Sprint 4 | Frontend | `hub/hero/manage/page.tsx:34-35` hardcodes title/subtitle/button text; `faq/manage/page.tsx` sources all copy from `microcopy.ts`. | Low | Low | Add `hubHero` block to `microcopy.ts`; mirror FAQ manage page structure. | Discovered |
| AUD-178 | Sprint 4 | Frontend | `community-leader-panel.tsx:78-123` (`JoinRequestActions`) duplicates `admin/communities/join-request-row.tsx` — same `handleJoinRequest`, different refresh (reload vs `revalidatePath`). | Medium | Medium | Extract shared `JoinRequestActions` client component; unify on `router.refresh()`. | Discovered |
| AUD-180 | Sprint 4 | Frontend | `contacts-list.tsx:66-77` `RatingBadge` is a third star+count chip alongside detail-page inline blocks (AUD-062) and unused `StarRatingDisplay` (AUD-063). | Low | Low | Extend `StarRatingDisplay` with `showValue`; reuse in contacts list. | Discovered |
| AUD-184 | Sprint 4 | Frontend | Detail back-nav inconsistent: `Breadcrumb` on tickets/forums; `← Feature` text links on events/facilities; neither on polls. | Low | Low | Standardize on `Breadcrumb` for all authenticated detail pages. | Discovered |
| AUD-186 | Sprint 4 | Frontend | `pending-bookings.tsx:50-52` always refetches on mount even when `facilities/[id]/page.tsx:138-143` passes `initialBookings`. | Low | Medium | Skip initial fetch when initial data provided; refetch only after mutations. | Done — `pending-bookings.tsx:53-55` skips fetch when `initialBookings.length > 0`. |
| AUD-191 | Sprint 4 | Frontend | `gate/page.tsx` — hand-rolled h1, raw cards, no `PageHeader`/`SoftCard`/`FadeIn`. | Low | Medium | Add `gate` feature key; adopt resident shell conventions. | Discovered |
| AUD-205 | Sprint 4 | Backend | `page.tsx` runs `Promise.all([getHubData(), listActiveHubHeroSlides(), canManageHubHero()])` — hero slides are a separate query despite being hub-page-only content. | Low | Low | Add optional hero slides to `getHubData()` or a thin `getHubPageData()` wrapper. | Discovered |
| AUD-207 | Sprint 4 | Microcopy | `lib/search/types.ts` `NAVIGATION_SHORTCUTS` hardcodes labels ("Book a spot", "Get help") that duplicate `microcopy.ts`. Search shortcuts can drift from resident UI copy. | Low | Medium | Build shortcuts from `microcopy.ts` + route map. | Discovered |

---

### Sprint 5 — Dead code & lib DRY

| ID | Sprint | Area | Description | Complexity | Impact | Pointers to Solve | Status |
|----|--------|------|-------------|------------|--------|-------------------|--------|
| AUD-170 | Sprint 5 | Frontend | Entire `src/components/landing/` folder (8 files) has **zero external importers** — dead marketing layout parallel to hub. | Medium | Medium | Delete the folder, or wire a public marketing route; stop maintaining duplicate carousels. | Discovered |
| AUD-171 | Sprint 5 | Frontend | `landing/hero-carousel.tsx` reimplements Carousel+Autoplay with hardcoded banner URLs; `hub-hero-carousel.tsx` correctly wraps `shared/image-carousel.tsx`. | Medium | Medium | Delete with AUD-170, or migrate to `ImageCarousel`. | Discovered |
| AUD-172 | Sprint 5 | Frontend | gulshandynasty.com image URLs catalogued separately in `hub-images.ts`, `hub-hero.ts` fallbacks, `landing/gallery-carousel.tsx`, `landing/hero-carousel.tsx` — overlapping URLs. | Medium | Medium | Single catalog in `lib/hub-images.ts`; all consumers import from there. | In Progress — `upload-constants.ts` added for upload limits; image URL catalog still fragmented across hub + landing files. |
| AUD-173 | Sprint 5 | Frontend | `hub-hero-carousel.tsx` is a 20-line DTO→`ImageCarousel` mapper with no additional behavior. | Low | Low | Inline mapping in `hub-hero.tsx` unless reuse is planned. | Discovered |
| AUD-195 | Sprint 5 | Backend | Identical 12-line `guardEditor()` copy-pasted in `api/faq/items/route.ts` and `api/faq/sections/route.ts`. | Low | Low | Extract shared `guardFaqEditorRoute()` in `faq-auth.ts`. | Discovered |
| AUD-196 | Sprint 5 | Backend | `api/faq/manage/route.ts` GET applies auth + `requireFaqEditor` but skips the FAQ write rate limit used by items/sections routes. | Low | Low | Reuse shared guard from AUD-195 on manage route. | Discovered |
| AUD-201 | Sprint 5 | Backend | `staff/[id]/reviews/route.ts` GET inlines paginated review fetch; `contact-reviews.ts` already exports `listContactReviews()`. | Low | Low | Add `listStaffReviews()` to `lib/staff.ts`; call from route. | Discovered |
| AUD-202 | Sprint 5 | Backend | `getContactReviewAggregate(s)` in `contact-reviews.ts` and `getStaffReviewAggregate(s)` in `staff.ts` are structurally identical (~40 lines each). | Medium | Low | Extract generic review-aggregate helpers to `lib/review-aggregates.ts`. | Discovered |
| AUD-203 | Sprint 5 | Backend | Mixed audit patterns: some routes use `logAction()`, others call `db.auditLog.create()` directly (`contacts/route.ts`, `staff/[id]/associations`, `admin/users`). | Low | Low | Standardize on `logAction()` everywhere. | In Progress — `logAction()` widely adopted; `api/contacts/route.ts:43` still uses `db.auditLog.create` directly. |
| AUD-204 | Sprint 5 | Backend | Unread notification count queried three ways: inline in `hub-data.ts`, `getUnreadCount()` in `notifications.ts`, inline in `notifications/page.tsx`. | Low | Low | Route all three through `getUnreadCount(userId)`. | Discovered |
| AUD-206 | Sprint 5 | Types | DTO location inconsistent: hub shapes in `types/hub.ts`, while `HubHeroSlideDto`/`FaqSectionDto` live in `lib/hub-hero.ts`/`lib/faq.ts`. `HubPoll` lacks `scope`/`subCommunityId`. | Medium | Medium | Move shared DTOs to `types/`; extend `HubPoll`/`HubEvent` with scope fields. | Discovered |
| AUD-208 | Sprint 5 | Backend | `forums/rbac.ts` defines local `UserContext`; `forums/[slug]/threads/route.ts` casts `session.user` twice. Session fields already declared in `types/auth.d.ts`. | Low | Low | Add `toForumUserContext(session.user)` using augmented Session type. | Discovered |
| AUD-209 | Sprint 5 | Backend | `canManageFaq()` re-checks `globalRole` separately from `isAdmin()` in `rbac.ts`, and adds `isActive`/`approvalStatus` gates that `isAdmin()` skips. Admin FAQ access semantics differ from other admin gates. | Low | Medium | Compose: `isAdmin(userId) \|\| hasActiveDesignation(userId)` with explicit docs on inactive admin rights. | In Progress — `canManageFaq` deprecated alias of `canManageCommunityContent()`; semantic difference from `isAdmin()` may be intentional (requires active + approved). Document or align. |
| AUD-210 | Sprint 5 | Backend | All five cron routes duplicate identical GET+POST wrappers around `authorizeCronRequest()` + try/catch. | Low | Low | Extract `withCronAuth(handler)` in `cron-auth.ts`. | Discovered |
| AUD-213 | Sprint 5 | Backend | `requireApprovedResident()` in `staff-auth.ts` returns user object or `null`, but name implies boolean. Every caller does `if (!approved)`. | Low | Low | Rename to `getApprovedResident()` or split into `isApprovedResident()` + getter. | Discovered |

---

## Notes for the executor

1. **Sprint 4 next** — page convention batch (`PageHeader`, `Breadcrumb`, `EmptyState`) across packages, notifications, files, profile, detail pages, gate.
2. **Delete dead code early** — AUD-170 (landing folder, 8 files) reduces maintenance surface with zero user impact.
3. **AUD-186** verified done — archive on next `summarize and clean`.
4. **Cross-backlog** — UI/UX backlog: 14 active items (12 open + 1 in progress + 1 deferred); coordinate AUD-153 with Sprint 4 page work.

---

*Total active: **30** refactor (27 open + 3 in progress) + **14** UI/UX (12 open + 1 in progress + 1 deferred) = **44 items**. **4** done pending archive (AUD-139, AUD-140, AUD-147, AUD-186).*
