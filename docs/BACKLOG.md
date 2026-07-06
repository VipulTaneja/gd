# Gulshan Dynasty — Product Backlog

> **Usage:** This file tracks active development work. Deferred items are in `docs/hold-backlog.md`. Completed items are archived in `docs/tracking/archive/`.

**Status Legend:**
- `BACKLOG` — Not started
- `IN_PROGRESS` — Currently being worked on
- `DONE` — Completed and verified
- `BLOCKED` — Waiting on a dependency or decision
- `DEFERRED` — Pushed to a future phase → see `docs/hold-backlog.md`

---

## Sprint 5 — Files & Notifications

### Epic 14: Notifications & Communication

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| E14-S7 | Trigger notifications for: user approved, new poll created, new event, ticket status change, due reminder, notice published | M | DONE | Call `createNotification` from respective server actions; check user preferences before creating | Approval, poll, event, notice triggers implemented |

---

## Profile Pages (Cross-Cutting Feature)

> **Design Reference:** See `docs/DESIGN-PROFILES.md` for full wireframes, visibility matrix, and component specs.
>
> **Core Rule:** Every user name and unit number anywhere in the portal is a **clickable hyperlink** to its profile page.

### Shared Components

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| PROF-S1 | Build `<UserLink />` component — clickable name with optional avatar, hover tooltip (role + unit) | S | DONE | `/components/shared/user-link.tsx`; links to `/users/[userId]`; gold accent underline on hover; optional `showAvatar` prop | |
| PROF-S2 | Build `<UnitLink />` component — tower-colored badge linking to unit profile page | S | DONE | `/components/shared/unit-link.tsx`; links to `/units/[unitNumber]`; Tower A=gold `#d4af37`, B=teal `#2dd4bf`, C=rose `#f43f5e` | |
| PROF-S3 | Build `<MembershipTimeline />` component — vertical timeline of unit↔user relationships | M | DONE | `/components/shared/membership-timeline.tsx`; `perspective` prop: "user" shows units, "unit" shows people; active=highlighted, expired=gray | |

### User Profile Page (`/users/[userId]`)

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| PROF-S4 | User Profile — public view: header (avatar, name, role badge, status), unit & residency section, community memberships, RWA designation, activity summary | L | DONE | Server component; query User + active UnitMemberships + CommunityMemberships + Designations + aggregates (vote/rsvp/ticket counts); role-based visibility per DESIGN-PROFILES.md §2.1 | |
| PROF-S5 | User Profile — self-edit mode: inline forms for name, phone, avatar upload, emergency contact, vehicle plates | M | DONE | Edit button per section → opens form; avatar upload to MinIO via presigned URL; `vehiclePlates` as tag input (add/remove); React Hook Form + Zod; server action to update User | |
| PROF-S6 | User Profile — admin sections: change role dropdown, deactivate button, approval status, unit claim review, full membership history timeline, link to filtered audit log | M | DONE | Rendered only when viewer.globalRole is ADMIN/SUPER_ADMIN; uses `<MembershipTimeline perspective="user" />`; role change triggers session invalidation + audit log | |

### Unit Profile Page (`/units/[unitNumber]`)

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| PROF-S7 | Unit Profile — resident view: header (unit badge, tower, floor, type, area, parking), current residents list, dues status summary, active visitor passes, open tickets, registered vehicles | L | DONE | Server component; query Unit + active UnitMemberships (with User join) + latest Dues + active VisitorPasses + open HelpTickets; all resident names rendered as `<UserLink />`; visibility scoped per DESIGN-PROFILES.md §3.4 | |
| PROF-S8 | Unit Profile — admin sections: assign resident button, transfer ownership button, generate due button, full membership history timeline | M | DONE | Rendered only for admins; "Assign Resident" opens modal (user search + role + dates); "Transfer" opens atomic transfer flow; uses `<MembershipTimeline perspective="unit" />` | |

### Retrofit Existing Pages

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| PROF-S9 | Replace all plain-text user names with `<UserLink />` across: admin tables, ticket comments, audit log, poll voters, RSVP lists, community member lists, notification items | M | DONE | Audit all pages; grep for rendered user names; swap with component; ensure userId is passed to all list queries | Retrofitted: tickets, admin users, admin tickets, admin units, directory |
| PROF-S10 | Replace all plain-text unit numbers with `<UnitLink />` across: directory, user profiles, ticket details, visitor pass details, dues tables, admin unit table, audit log | M | DONE | Audit all pages; grep for rendered unit numbers; swap with component; ensure unitNumber is available in all relevant queries | Retrofitted: admin users, admin units, directory |
| PROF-S11 | Add global search (Cmd+K command palette) — search users by name and units by number, navigate to profile | M | DONE | shadcn Command component (`cmdk`); API endpoint `/api/search?q=...` queries User.name ILIKE and Unit.unitNumber ILIKE; returns top 5 each; navigate on select | Custom implementation with debounce |

---

## Community Hub Landing Redesign

> **Full trackable backlog:** [`docs/tracking/backlog-hub-redesign.md`](tracking/backlog-hub-redesign.md) (17 items, HUB-S1–S17)

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| HUB-* | See dedicated hub redesign backlog | — | BACKLOG | Replace scroll-heavy brand landing with single-viewport Community Hub |

---

## Product Improvements (PM Review)

> **Full trackable backlog:** [`docs/tracking/backlog-product-improvements.md`](tracking/backlog-product-improvements.md) (52 items, IMP-001–507)

| Priority | Count | Theme |
|---|---|---|
| P0 | 10 | V1 product debt — fix before new features |
| P1 | 18 | Daily life + governance + notifications |
| P2 | 17 | Dues, amenities, community life |
| P3 | 7 | Long horizon (deferred) |

**Start here:** IMP-001 (onboarding enforcement) → IMP-003 (poll eligibility) → IMP-101 (domestic help)

**Stakeholder roadmap:** [`docs/PRODUCT-ROADMAP.md`](PRODUCT-ROADMAP.md)

---

## Summary Statistics

| Metric | Count |
|---|---|
| Done | 12 |
| Backlog (product improvements) | 45 (in tracking/backlog-product-improvements.md) |
| Deferred | 29 (in hold-backlog.md) |
| Completed (archived) | 83 (in tracking/archive/) |

---

## Discussion Forums (New Feature)

> **Full trackable backlog:** [`docs/tracking/backlog-discussion-forums.md`](tracking/backlog-discussion-forums.md) (48 items, FORUM-001–071)

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| FORUM-* | Discussion forums — native module + free OSS libraries (TipTap, react-markdown, etc.) | L | BACKLOG | Supersedes async portion of `P2-12` / `IMP-503` in hold-backlog; real-time chat still deferred |

---

*Last updated: 2026-07-06 | v1.3*
