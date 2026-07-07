# Gulshan Dynasty Portal — Roles & Permissions

**Document type:** Access control reference  
**Version:** 1.0  
**Date:** 7 July 2026  
**Audience:** Developers, RWA committee, support staff  
**Related docs:** [Specification index](./README.md) · [Functional Spec](./functional-spec.md) · [Architecture](./architecture.md) · [Design Profiles](./design-profiles.md) · [Dev backlog](../dev/backlog.md)

> **How to read this doc:** Each row answers “Can this person do this thing?” If you’re debugging “403 Forbidden”, start here before blaming the Wi‑Fi.

---

## 1. Role hierarchy (quick map)

```
SUPER_ADMIN ──► everything ADMIN can do + bootstrap-only actions
     │
   ADMIN ──────► society operations (/admin/*)
     │
 RESIDENT ─────► approved portal user (default after signup)
     │
 NON_RESIDENT ─► external stakeholder (schema exists; limited UI today)
     │
SECURITY_STAFF ► gate device login only (/gate/*)
```

**Unit-level roles** (time-bound, per flat — a user can hold several):

| Role | Typical person | Voting | Facility booking | Visitor passes |
|---|---|---|---|---|
| `OWNER` | Flat owner | Yes (per poll rules) | Yes | Yes |
| `JOINT_OWNER` | Co-owner | Yes | Yes | Yes |
| `TENANT` | Rented occupant | Per poll rules | Yes | Yes |
| `OWNER_FAMILY` | Owner’s family | No | No | Usually no |
| `TENANT_FAMILY` | Tenant’s family | No | No | Usually no |

**Delegated leadership** (assigned by Super Admin — not separate login accounts):

| Scope | Who | Can do |
|---|---|---|
| Unit leader | `Unit.leaderUserId` | Invite tenant / family roles; cancel pending invites |
| Community admin | `CommunityRole.ADMIN` | Approve joins; scoped events/notices/forums |
| Facility leader | `FacilityLeader` | Approve/reject bookings for that amenity |

---

## 2. Global roles — detailed matrix

### 2.1 Authentication & account

| Action | Guest | Pending resident | Approved resident | Admin | Super Admin | Security staff |
|---|---|---|---|---|---|---|
| View Community Hub (`/`) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sign in (OAuth / email / dev) | ✅ | ✅ | ✅ | ✅ | ✅ | PIN only |
| Access most resident routes | ❌ | ⚠️ partial | ✅ | ✅ | ✅ | Gate only |
| Access `/admin/*` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Approve/reject users | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Assign global roles | ❌ | ❌ | ❌ | ⚠️ limited | ✅ | ❌ |
| Bootstrap first admin | ❌ | ❌ | ❌ | ❌ | ✅ (setup flow) | ❌ |

**Pending residents** can sign in but many features require `approvalStatus === APPROVED` and `isActive === true`.

### 2.2 Society-wide content

| Action | Family member | Approved resident | Community admin | Admin |
|---|---|---|---|---|
| Read notices (tower-filtered) | ✅ | ✅ | ✅ | ✅ |
| Read events / RSVP | ✅ | ✅ | ✅ (scoped) | ✅ |
| Vote in polls | ❌ | Per eligibility rule | Per rule | ✅ |
| Create global poll/event | ❌ | ❌ | ❌ | ✅ |
| Create club poll/event | ❌ | ❌ | ✅ (own club) | ✅ |
| Read file vault (global) | ✅ | ✅ | ✅ | ✅ |
| Upload global vault files | ❌ | ❌ | ❌ | ✅ |
| Global search (Cmd+K) | ❌ | ✅ | ✅ | ✅ (+ admin mode planned) |
| Discussion forums — read global | ❌ | ✅ | ✅ | ✅ |
| Discussion forums — post | ❌ | ✅ | ✅ (global + own club) | ✅ |
| Forum moderation | ❌ | ❌ | ✅ (own club forum) | ✅ |
| Read Help & FAQ (published) | ✅ (guest `/faq`) | ✅ (`/faq/app`) | ✅ | ✅ |
| Edit Help & FAQ | ❌ | ❌ | ✅ (active committee designation) | ✅ |

**FAQ editors:** Super Admin, Admin, or any user with an active `Designation` (President, Vice President, Secretary, Treasurer, Committee Member). Requires `approvalStatus === APPROVED` and `isActive === true`. Manage UI at `/faq/manage` (not under `/admin/*`, so committee members can access).

### 2.3 Unit & directory privacy

| Action | Any approved resident | Unit member | Admin |
|---|---|---|---|
| Directory — see names in flats | ✅ | ✅ | ✅ |
| Directory — see phone/email | ❌ | ❌ | ✅ |
| User profile — public fields | ✅ | ✅ | ✅ |
| User profile — contact details | Self only | Self only | ✅ |
| Unit profile — resident names | ✅ | ✅ | ✅ |
| Unit profile — dues, passes, tickets | ❌ | ✅ | ✅ |
| Edit own profile | Self | Self | ✅ |

### 2.4 Operations (tickets, facilities, visitors)

| Action | Family | Owner/Tenant | Admin |
|---|---|---|---|
| Raise ticket | ✅ | ✅ | ✅ |
| Attach photos to ticket | ✅ | ✅ | ✅ |
| Book facility (eligible roles) | ❌ | ✅ | ✅ (needs unit membership) |
| Cancel own booking | ❌ | ✅ | ✅ |
| Approve facility booking | ❌ | ❌ | ✅ (+ facility leader) |
| Create visitor pass | ❌ | ✅ | ✅ |
| Staff-linked daily passes | — | Auto via cron | Manage staff |
| Validate pass at gate | — | — | Security staff / open `/gate` |

**Facility booking roles:** `OWNER`, `JOINT_OWNER`, `TENANT` only (`canBookFacility`).

**Pass limit:** Max 10 active passes per resident — **staff cron passes are exempt** (BR-07).

### 2.5 Finance & governance

| Action | Unit member | Treasurer (admin) | Admin |
|---|---|---|---|
| View own unit dues | ✅ | ✅ | ✅ |
| Mark due paid / upload receipt | ❌ | ✅ | ✅ |
| Generate dues for all units | ❌ | ✅ | ✅ |
| Defaulter aging report | ❌ | ✅ | ✅ |
| AGM pack / quorum dashboard | ❌ | ✅ | ✅ |
| Emergency broadcast | ❌ | ✅ | ✅ |
| Audit log | ❌ | ✅ | ✅ |
| CSV export | ❌ | ✅ | ✅ |

---

## 3. Staff registry & Regular Help

**URLs:** `/staff` (directory) · `/staff/[id]` (profile) · `/staff/search` (associate flow)

### 3.1 Staff role types

| Category | Roles | Scope | Resident can add to unit? |
|---|---|---|---|
| **Unit staff** | Maid, Nanny, Cook, Driver, Gardener, Other | `UNIT` — linked to flat(s) | ✅ (active unit member) |
| **Society staff** | Guard, Facility, Electrician, Plumber | `SOCIETY` — GD-wide | ❌ (admin-managed seed) |

Society staff appear in **Regular Help** for everyone to see and review; residents cannot add/remove them from their unit.

### 3.2 Staff actions matrix

| Action | Guest | Pending | Approved resident | Unit member | Admin |
|---|---|---|---|---|---|
| View `/staff` list (all active staff) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Filter “My unit” vs “All help” | ❌ | ❌ | ✅ | ✅ | ✅ |
| View staff profile `/staff/[id]` | ❌ | ❌ | ✅ | ✅ | ✅ |
| See staff phone on profile | ❌ | ❌ | ❌ | ❌ | ✅ (admin UI) |
| See staff phone at gate validate | — | — | — | — | Security only |
| Search staff (name / phone) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Create new staff + associate | ❌ | ❌ | ✅ | ✅ (own units) | ✅ |
| Add existing staff to my unit | ❌ | ❌ | ✅ | ✅ | ✅ |
| Remove staff from my unit | ❌ | ❌ | ✅ | ✅ (own unit link) | ✅ |
| Review staff (1–5 stars) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit/delete own review | ❌ | ❌ | ✅ | ✅ | ✅ |
| Max 5 active unit associations per staff | — | — | Enforced | Enforced | Enforced |

**Manage vs add icons on Regular Help tiles:**
- **Add** (`UserPlus`): staff not yet on caller’s unit, unit-scoped role, caller has active membership
- **Remove** (`UserMinus`): staff linked to caller’s unit and caller can manage that association
- **Neither:** society staff, or no eligible unit

### 3.3 Gate integration

| Data | Resident API | Gate validate API |
|---|---|---|
| Staff name, role, units | ✅ | ✅ |
| Photo | Initials placeholder | Initials / photo when uploaded |
| Phone | ❌ | ✅ (guard verification only) |

Daily `DAILY_HELP` passes generated at 6 AM IST via cron (`/api/cron/generate-staff-passes`), linked by `staffPersonId`.

---

## 4. Important contacts (vendor directory)

**URLs:** `/contacts` · `/contacts/[id]`

| Action | Pending | Approved resident | Creator | Admin |
|---|---|---|---|---|
| Browse contact list | ❌ | ✅ | ✅ | ✅ |
| View detail + phone | ❌ | ✅ | ✅ | ✅ |
| Create contact | ❌ | ✅ | ✅ | ✅ |
| Edit contact | ❌ | ❌ | Own or admin | ✅ |
| Review contact | ❌ | ✅ (if reviewable) | ✅ | ✅ |
| Review “Internal Intercom” | ❌ | ❌ | ❌ | ❌ |

**Staff vs contacts:** Staff = people (maids, guards). Contacts = businesses (laundry, courier). See cross-link banner on contact detail → Regular Help.

---

## 5. Middleware & route protection

| Route pattern | Auth required | Notes |
|---|---|---|
| `/`, `/login` | No | Hub is public |
| `/dashboard`, `/profile`, `/notifications`, `/directory`, `/forums/*` | Yes | Middleware JWT check |
| `/staff`, `/staff/*` | Yes (page-level) | Listed in code; ensure matcher includes `/staff` |
| `/admin/*` | Yes + admin role on page | Non-admins redirected |
| `/gate`, `/gate/*` | Security PIN or open validate | Validation endpoint usable at gate |
| `/api/*` (except `/api/auth`) | Per-route | Rate limit 100 req/min/IP |

Most resident feature pages also call `auth()` and redirect to `/login` if unauthenticated.

---

## 6. Poll eligibility (voting rules)

| Poll setting | Who may vote |
|---|---|
| All residents | Any user with active unit membership |
| Owners only | `OWNER` or `JOINT_OWNER` on any unit |
| One per unit | One vote per unit (enforced in vote API) |

Family members (`OWNER_FAMILY`, `TENANT_FAMILY`) cannot vote regardless of setting.

---

## 7. Implementation references

| Concern | Code location |
|---|---|
| Global admin check | `src/lib/rbac.ts` → `isAdmin()` |
| Unit membership | `src/lib/rbac.ts` → `hasActiveUnitRole()`, `getUserUnitMemberships()` |
| Facility booking | `src/lib/rbac-leaders.ts` → `canBookFacility()` |
| Delegated leadership | `src/lib/rbac-leaders.ts` |
| Staff RBAC | `src/lib/staff-auth.ts` |
| Staff role scope | `src/lib/staff-labels.ts` |
| Forum access | `src/lib/forums/rbac.ts` |
| Middleware | `src/middleware.ts` |

---

## 8. Known gaps & planned changes

| Gap | Current behavior | Backlog |
|---|---|---|
| Staff in global search | Not indexed | STAFF-048 |
| Orphan staff when unit vacant | Manual admin review | STAFF-085, STAFF-090 |
| Staff photo upload | Initials only | STAFF-038 |
| Notify unit on staff add/remove | Not sent | STAFF-077 |
| Admin merge duplicate staff | Not built | STAFF-071 |
| Contact review moderation | No hide UI | CONT-026 |

Full tracking: [`backlog-staff-registry.md`](../dev/backlog-staff-registry.md)

---

## 9. Document history

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-07-07 | Initial matrix — staff registry v2, contacts reviews, delegated leadership |

---

*When in doubt: if they live in the flat, check unit membership. If they work at the gate, check society scope. If they fix your geyser, they might be both — check the role column.*
