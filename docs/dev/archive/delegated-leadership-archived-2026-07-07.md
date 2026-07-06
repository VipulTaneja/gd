# Delegated Leadership — Archived Items

> **Source:** [`backlog-delegated-leadership.md`](../backlog-delegated-leadership.md)
> **Archived:** 2026-07-07
> **Count:** 77 completed items (v1 core implementation)

---

## Phase 0 — Spec & schema (7 items)

| ID | Description | P | Cplx | Deps |
|---|---|---|---|---|
| LEAD-001 | Document in `functional-spec.md` §3 + audit action appendix | P0 | S | — |
| LEAD-002 | `Unit.leaderUserId` `@unique`, assignment metadata; migration | P0 | M | LEAD-001 |
| LEAD-003 | `FacilityLeader` join table; migration | P0 | M | LEAD-001 |
| LEAD-004 | `Notice.subCommunityId` optional; migration | P0 | M | LEAD-001 |
| LEAD-006 | `requireSuperAdmin()`, `requireAdmin()`, leader RBAC helpers, `assertUnitLeaderScope`, `canBookFacility()` (BR-04) | P0 | M | LEAD-002, LEAD-003 |
| LEAD-007 | `UnitMembershipRequest` + partial unique `(unitId, userId) WHERE status='PENDING'` (SQL migration) | P0 | M | LEAD-001 |
| LEAD-008 | `FacilityBooking` review fields; migration | P0 | S | LEAD-001 |

## Phase 1 — Unit leadership (34 items)

| ID | Description | P | Cplx | Deps |
|---|---|---|---|---|
| UL-010 | Super Admin UI: assign/remove unit leader (`admin/units/[id]`, user search) | P0 | M | LEAD-002 |
| UL-011 | `assignUnitLeader` — Super Admin; user `APPROVED`; **require** active unit membership (any role); atomic reassignment; block deactivated users (UL-046) | P0 | S | LEAD-002, LEAD-006 |
| UL-012 | Unit profile: show leader + badge | P1 | XS | UL-010 |
| UL-013 | Leader invite flow: role picker (`TENANT`, `OWNER_FAMILY`, `TENANT_FAMILY` only — not `OWNER`/`JOINT_OWNER`); privacy-safe user search (UL-047) | P0 | L | LEAD-006, LEAD-007, UL-047 |
| UL-014 | `inviteUnitMemberByLeader` → `LEADER_INVITE` request | P0 | M | UL-013, LEAD-007 |
| UL-016 | Leaders use invite/accept paths only; admin keeps `assignResident` | P1 | S | UL-014 |
| UL-018 | Cannot invite users not in system | P0 | XS | UL-013 |
| UL-019 | Leader dashboard: residents + pending invites (own unit) | P0 | M | LEAD-006, LEAD-007 |
| UL-020 | **v1:** `CLAIM` approval **admin-only** (`approveClaim`, UL-026). **Post-ONB-001:** leader approves non-owner claims. `LEADER_INVITE` → UL-043 | P0 | M | UL-037, UL-030 |
| UL-021 | `assertUnitLeaderScope` on all leader endpoints | P0 | M | LEAD-006 |
| UL-022 | Hide leader actions on other units; allow public name-only profile view | P0 | S | UL-021 |
| UL-023 | Audit all `UnitMembership` mutations; allow-list includes `assignResident`, `approveClaim`, moves | P0 | M | — |
| UL-024 | QA checklist: leader A cannot invite for unit B | P1 | S | UL-021 |
| UL-025 | **v1:** Leader queue = `LEADER_INVITE` only; claims admin-only | P0 | S | UL-030 |
| UL-026 | Membership with **requested role**; refactor `approveClaim` in `admin/users/server-actions.ts` (not hard-coded OWNER when role available) | P0 | M | UL-037 |
| UL-027 | Unit profile visibility matrix | P0 | M | — |
| UL-029 | Block invite/accept when `approvalStatus !== APPROVED` | P0 | S | UL-014, UL-043 |
| UL-030 | All onboarding claims → admin queue only (v1) | P0 | S | — |
| UL-032 | Audit `MoveRequest` complete — admin-only membership changes | P0 | M | UL-023 |
| UL-033 | Reject duplicate pending invite **or** invitee already active member of unit (400) | P0 | XS | UL-014 |
| UL-035 | Leader reassigned → pending invites stay with unit | P0 | S | UL-011, LEAD-007 |
| UL-036 | No leader assigned → no leader invite actions; admin direct assign + claim queue unchanged | P0 | XS | UL-025 |
| UL-037 | Split: `LEADER_INVITE` → invitee accept/decline (UL-043); `CLAIM` → admin (v1) | P0 | M | UL-043, UL-020 |
| UL-038 | Block self-invite | P0 | XS | UL-014 |
| UL-038b | Block leader invite as `OWNER` / `JOINT_OWNER` (admin-only roles) | P0 | XS | UL-013, UL-014 |
| UL-039 | Block self-approval on claims (admin path) | P0 | XS | UL-020 |
| UL-040 | **v1:** Admin claim panel — all claims; show unit + assigned leader (informational); approve/reject; no leader routing | P0 | M | UL-030 |
| UL-041 | `syncTowerCommunitiesForUser()` on membership create | P0 | XS | UL-043 |
| UL-043 | **Invitee accept/decline UI** — profile card + notification deep link; `acceptUnitInvite` / `declineUnitInvite` actions; reject if invitee deactivated | P0 | M | UL-014, LEAD-007 |
| UL-044 | **Leader/admin cancel** pending invite; audit | P0 | S | UL-014 |
| UL-045 | Expire stale invites (`expiresAt` → `EXPIRED`); cron or lazy on read | P1 | S | LEAD-007 |
| UL-046 | Deactivated unit leader → block actions; admin UI to reassign; optional clear `leaderUserId` | P0 | S | UL-011 |
| UL-047 | Invite search: **name + unit only** in results (no email/phone); align SRCH-020 privacy | P0 | S | UL-013 |
| UL-049 | Invite role prerequisites: `TENANT_FAMILY` requires active `TENANT` on unit; `OWNER_FAMILY` requires active `OWNER`/`JOINT_OWNER`; **one active `TENANT` per unit** (block second tenant invite/assign) | P0 | S | UL-014 |

## Phase 1b — Pets & vehicles (4 items)

| ID | Description | P | Cplx | Deps |
|---|---|---|---|---|
| PV-010 | Any active unit member CRUD pets/vehicles | P0 | S | — |
| PV-011 | Edit controls for all active members | P0 | XS | PV-010 |
| PV-012 | Reject mutations from non-members | P0 | S | PV-010 |
| PV-013 | View vs edit split per UL-027 | P0 | S | UL-027 |

## Phase 2 — Community leadership (21 items)

| ID | Description | P | Cplx | Deps |
|---|---|---|---|---|
| CL-010 | Community create / archive → Super Admin only (today any `ADMIN` can archive) | P0 | XS | — |
| CL-011 | Super Admin assign/remove leaders (user search) | P0 | M | CL-010 |
| CL-012 | List/remove leaders on admin community detail | P0 | S | CL-011 |
| CL-013 | Leader dashboard on `/communities/[id]` | P0 | M | LEAD-006 |
| CL-014 | `handleJoinRequest` → community leaders + admin override; **403 for tower `targetBlock` communities** (CL-021) | P0 | M | CL-013, CL-021 |
| CL-015 | Leader create scoped event | P0 | M | CL-024 |
| CL-016 | Leader publish scoped notice (not EMERGENCY) | P0 | L | LEAD-004, CL-026 |
| CL-017 | Notice list filters for community scope | P0 | M | CL-016, CL-030 |
| CL-018 | Verify `canModerate()` for assigned leaders; regression test | P1 | S | CL-011 |
| CL-020 | Microcopy: Community Leader | P1 | XS | — |
| CL-021 | Tower communities: no join UI; moderation-only | P0 | S | — |
| CL-022 | Tower leader assignment (moderation) | P1 | S | CL-021 |
| CL-024 | Lock down `POST /api/events` | P0 | M | LEAD-006 |
| CL-025 | Lock down `POST /api/polls` | P0 | M | LEAD-006 |
| CL-026 | Lock down `POST /api/notices` | P0 | M | LEAD-006, LEAD-004 |
| CL-027 | Scoped create notifications (members only) | P0 | M | CL-024 |
| CL-028 | Admin join panel + shared server action with CL-013 | P0 | S | CL-014 |
| CL-029 | Tower leader = content + forum; membership read-only | P0 | S | CL-021 |
| CL-030 | Filter GET notices for community scope | P0 | M | LEAD-004 |
| CL-031 | Filter GET events/polls for `SUB_COMMUNITY` | P0 | M | CL-024 |
| CL-032 | Community leader remove **MEMBER** (non-tower only); block tower auto-members + other `ADMIN`s; RWA Admin always; share logic with `removeCommunityMember` | P0 | M | CL-014, CL-021 |

## Phase 3 — Amenity leadership (9 items)

| ID | Description | P | Cplx | Deps |
|---|---|---|---|---|
| AL-009 | Wire pending bookings + approve/reject API | P0 | M | LEAD-008, AL-010 |
| AL-010 | **Admin facilities page** (`/admin/facilities`) — list + edit facility settings; **then** assign/remove amenity leaders (only analytics page exists today) | P0 | L | LEAD-003 |
| AL-011 | `assignAmenityLeader` / `removeAmenityLeader` — Super Admin; assignee must be `APPROVED` (unit membership **not** required) | P0 | S | AL-010 |
| AL-012 | Facility detail: show leaders | P1 | XS | AL-010 |
| AL-013 | Booking approval: amenity leader (primary) + **RWA Admin always** + Super Admin; leader-only queue UI when leader exists | P0 | M | AL-009, LEAD-006 |
| AL-014 | `PendingBookings` + `canApprove` | P0 | S | AL-013 |
| AL-015 | Notify leaders on pending booking | P1 | M | AL-013 |
| AL-020 | Capacity: exclude `PENDING_APPROVAL` on book; re-check on approve | P0 | M | AL-009 |
| AL-021 | Enforce **BR-04** on `POST /api/facilities/book`: `OWNER`, `JOINT_OWNER`, `TENANT` only — block `*_FAMILY` (403) | P0 | S | LEAD-006 |

## Phase 4 — Cross-cutting polish (2 items)

| ID | Description | P | Cplx | Deps |
|---|---|---|---|---|
| LEAD-022 | Seed: leaders + sample invites | P1 | S | LEAD-002, LEAD-007 |
| LEAD-023 | Update `design-profiles.md` | P1 | S | UL-012 |

---

## Key Files Implemented

| Area | Files |
|---|---|
| Schema | `prisma/schema.prisma`, `prisma/migrations/20260706230000_delegated_leadership/` |
| RBAC | `src/lib/rbac-leaders.ts`, `src/lib/unit-membership-requests.ts`, `src/lib/community-leaders.ts` |
| Unit leadership | `src/app/admin/units/[id]/assign-leader-form.tsx`, `src/components/units/unit-leader-panel.tsx`, `src/app/units/[unitNumber]/leader-actions.ts`, `src/app/profile/invite-actions.ts` |
| Community | `src/app/admin/communities/actions.ts`, `src/components/communities/community-leader-panel.tsx`, API routes `notices/events/polls` |
| Amenity | `src/app/admin/facilities/`, `src/app/api/facilities/approve/route.ts`, `src/components/facilities/pending-bookings.tsx` |
| Spec | `docs/specification/functional-spec.md` §3.3 |
| Seed | `prisma/seed.ts` (unit + amenity leaders) |

---

## v1 Acceptance Criteria (met)

1. Super Admin assigns unit leader; leader sees pending **invites** for own unit only.
2. Leader invites tenant → invitee **accepts** on profile/notifications → `TENANT` membership.
3. Cross-unit leader action → 403.
4. All onboarding claims on **admin queue only**.
5. Only admin transfers / ends membership / assigns owner.
6. Any unit member CRUD pets & vehicles.
7. Non-member cannot see dues, pets detail, tickets, pending invites.
8. Two community leaders; either approves join for non-tower club.
9. Community notice members-only; no EMERGENCY.
10. Community event + member-only notifications.
11. POST/GET content APIs enforce scope (CL-024–031).
12. Amenity leader approves booking for own facility; RWA Admin can always approve/reject (AL-013).
13. Self-invite blocked; invite search shows no email/phone; family cannot book facilities — BR-04.
14. Leader can cancel pending invite; invitee can decline.
15. All leader actions audited.
16. `npm run lint` and `npm run build` pass.

---

*v1 release gate criteria 1–16 met. See [`backlog-delegated-leadership.md`](../backlog-delegated-leadership.md) for v1.1 / P2 follow-on.*
