# Gulshan Dynasty Community Portal — Functional Specification

**Document type:** Functional Specification (FSD)  
**Version:** 1.1  
**Date:** 5 July 2026  
**Audience:** Product team, RWA committee, developers, residents (end-user sections)  
**Related docs:** [Architecture](../dev/architecture.md) · [Design Profiles](./design-profiles.md) · [Active Backlog](../dev/backlog.md)

---

## 1. Executive Summary

The **Gulshan Dynasty Community Portal** is a web-based platform for the Residents' Welfare Association (RWA) of Gulshan Dynasty, a gated community in Sector 144, Noida. It serves **204 homes** across **3 towers** (A, B, C) and supports day-to-day community operations: notices, events, polls, maintenance tickets, amenity booking, visitor passes, dues tracking, document storage, and sub-community groups.

**This is a resident portal, not a sales website.** It is designed for people who already live in the community.

| Attribute | Detail |
|---|---|
| Community | Gulshan Dynasty RWA |
| Location | GH-03D, Sector 144, Noida, UP 201306 |
| Units | 204 (198 apartments + 6 duplexes) |
| Unit naming | `{Tower}-{Floor}{Unit}` e.g. `C-0302` |
| Primary users | Owners, tenants, family members, RWA admins, security staff |
| Access | Web browser (desktop and mobile); login required for most features |

---

## 2. Document Structure

| Section | Primary audience | Purpose |
|---|---|---|
| §3–§5 | Product team | Personas, scope, module specifications |
| §6 | Product + QA | Business rules and workflows |
| §7 | Product team | User journey diagrams (onboarding, visitor, AGM, ticket) |
| §8–§11 | End users (residents) | How to use each feature |
| §12 | Product team | Implementation status and gaps |
| §13 | Product team | Product KPIs and success metrics |
| §14 | Product team | Phase 2 roadmap |
| §15 | All | Glossary |

---

## 3. User Personas & Roles

### 3.1 Personas (end-user perspective)

| Persona | Who they are | What they need |
|---|---|---|
| **Resident (Owner)** | Flat owner living in Gulshan Dynasty | Book amenities, create visitor passes, view dues, vote in polls, raise tickets |
| **Resident (Tenant)** | Rented flat occupant | Same as owner for day-to-day features; may have restricted voting/booking per society rules |
| **Family member** | Spouse/child of owner or tenant | View notices and events, raise tickets; cannot vote or book facilities |
| **RWA Admin** | Society office bearer or appointed manager | Approve users, manage units, publish notices, assign tickets, generate dues |
| **Community Admin** | Lead of a sub-group (e.g. Sports Club) | Manage club members, run scoped polls and events |
| **Security guard** | Gate staff | Validate visitor OTP/QR codes |
| **Guest / visitor (web)** | Non-logged-in user | View community hub, contact RWA, sign up for access |
| **Vendor / Contractor** | External service provider (electrician, plumber, AC repair) | View contact requests from residents; listed in RWA-vetted directory |
| **Treasurer** | RWA finance officer | Track dues collection, view defaulter aging reports, generate receipts, manage UPI payments |

### 3.2 System roles (product perspective)

| Role | Code | Description |
|---|---|---|
| Super Admin | `SUPER_ADMIN` | First bootstrap user; full system access including assigning other admins |
| Admin | `ADMIN` | RWA operations: users, units, notices, dues, tickets, audit |
| Resident | `RESIDENT` | Default role after registration |
| Non-Resident | `NON_RESIDENT` | External stakeholder with limited access (assignable) |
| Security Staff | `SECURITY_STAFF` | Gate validation only (partially implemented) |

**Unit-level roles** (time-bound, per flat):

| Role | Meaning |
|---|---|
| Owner | Primary flat owner |
| Joint Owner | Co-owner with equal rights |
| Tenant | Rented occupant |
| Owner's Family | Family of owner |
| Tenant's Family | Family of tenant |

A user may hold **multiple unit memberships** (e.g. owner of A-0302 and tenant of B-1201). Each membership has a **start date** and optional **end date**; access expires automatically when the end date passes.

**Sub-community roles:**

| Role | Meaning |
|---|---|
| Admin | Manages a specific club/group |
| Member | Participant in the group |

### 3.3 Delegated leadership (v1)

Super Admin assigns operational leaders without creating new accounts:

| Scope | Field / model | Assigned by | Capabilities |
|---|---|---|---|
| Unit | `Unit.leaderUserId` | Super Admin | Invite `TENANT` / family roles; invitee accepts; cancel pending invites |
| Sub-community | `CommunityRole.ADMIN` | Super Admin | Approve joins (non-tower); scoped events/notices; forum moderation |
| Facility | `FacilityLeader` | Super Admin | Approve/reject bookings (RWA Admin always has override) |

Unit leaders cannot assign owners, remove members, or approve onboarding claims (v1). See `docs/dev/archive/delegated-leadership-archived-2026-07-07.md` for v1 implementation details; active follow-on in `docs/dev/backlog-delegated-leadership.md`.

---

## 4. Product Scope

### 4.1 In scope (v1 — implemented or largely implemented)

| Module | Status |
|---|---|
| Community Hub (home page) | Implemented |
| Authentication (Google, Apple, email magic link, dev credentials) | Implemented |
| User registration & admin approval | Implemented |
| Onboarding enforcement (terms → unit claim → approval) | Implemented |
| Units & time-bound RBAC | Implemented |
| User & unit profile pages | Implemented |
| Unit claim admin approval workflow | Implemented |
| Resident directory | Implemented |
| Dashboard with launch readiness checklist | Implemented |
| Notice board with emergency templates | Implemented |
| Events & RSVP | Implemented (list view) |
| Polls & voting with eligibility enforcement | Implemented |
| AGM digital pack (event + resolution polls + quorum) | Implemented |
| Sub-communities (clubs/groups) | Implemented |
| Helpdesk & ticketing with SLAs and satisfaction ratings | Implemented |
| Ticket photo attachments | Implemented |
| Facility / amenity booking with waitlist and approval | Implemented |
| Visitor management (pass + gate validation) | Implemented |
| Domestic help registry (auto-generate daily passes) | Implemented |
| Delivery management (package notifications) | Implemented |
| Parking & vehicle registry | Implemented |
| Move-in / move-out workflow | Implemented |
| Emergency broadcast with acknowledgment | Implemented |
| Dues ledger with UPI QR payment | Implemented |
| Defaulter aging report | Implemented |
| File vault (global documents) | Implemented |
| RWA committee page | Implemented |
| In-app notifications with preferences | Implemented |
| Notification preferences per category | Implemented |
| Global search (Cmd+K) | Implemented |
| Admin role guard on all /admin/* routes | Implemented |
| Security staff PIN login | Implemented |
| Gate offline cache (service worker) | Implemented |
| Lost & Found board | Implemented |
| Pet registration | Implemented |
| Facility usage analytics | Implemented |
| Ticket satisfaction ratings | Implemented |
| User journey diagrams | Implemented |

### 4.2 Out of scope / Phase 2

| Feature | Notes |
|---|---|
| Online payment gateway (Razorpay) | UPI QR implemented; Razorpay deferred pending RWA approval |
| GST-compliant receipt PDF | BLOCKED — needs RWA GSTIN |
| Email notifications (bulk) | In-app notifications work; email templates deferred |
| SMS / push notifications | Not in v1 |
| Real-time chat | WhatsApp used informally |
| Recurring events (weekly yoga) | Manual event creation only |
| Tenant owner consent (NOC) workflow | Deferred — see hold-backlog.md |
| Vendor / contractor directory | Deferred — see hold-backlog.md |
| Event calendar grid view (FullCalendar) | Deferred — see hold-backlog.md |
| Sustainability dashboard | Deferred — see hold-backlog.md |

---

## 5. Functional Modules — Product Specification

### 5.1 Community Hub (Home Page)

**URL:** `/`  
**Access:** Public (guests and logged-in users see the same page with different content)

**Purpose:** Single-screen entry point to the portal — not a marketing site. Residents see live community data; guests see previews and login prompts.

| Element | Guest behavior | Logged-in resident behavior |
|---|---|---|
| Greeting | "Welcome to Gulshan Dynasty" | "Good {morning/afternoon/evening}, {FirstName} · Tower {X} · {Unit}" |
| Shortcut grid (8 tiles) | Links to `/login?callbackUrl=...` | Direct links to features |
| Live feed | Latest notices, events, polls (global) | Tower-filtered notices + personalized counts |
| Amenity chips | Links to login | Links to `/facilities` |
| Community pulse | Stats: 204 homes, 3 towers, IGBC Platinum | Same + optional weather |
| Contact RWA | Dialog form | Dialog form |

**Shortcut tiles:** Book Amenity · Visitor Pass · Raise Ticket · My Dues · Notices · Events · Polls · Directory

**Acceptance criteria (product):**
- Fits one desktop viewport without scrolling
- No full-page hero carousel or sales copy
- Badge counts on tiles when resident has open items (tickets, dues, notifications)

---

### 5.2 Authentication & Onboarding

**URLs:** `/login`, `/onboarding/terms`, `/onboarding/unit-claim`, `/pending`

#### Registration flow

```
Sign in (Google / Apple / Email magic link)
        │
        ▼
New user created → approvalStatus = PENDING
        │
        ▼
(Optional) Accept terms → /onboarding/terms
        │
        ▼
(Optional) Claim unit → /onboarding/unit-claim
        │
        ▼
Wait for admin approval → /pending (informational)
        │
        ▼
Admin approves → user can access portal
        │
        ▼
Redirect to /dashboard (or home)
```

**Business rules:**
- Registration is **not automatic** — admin must approve every new account
- Email is the unique identifier; same email across Google/Apple is linked to one account
- Deactivated users (`isActive = false`) cannot access the portal
- Terms acceptance and unit claim screens exist but are **not yet enforced** as mandatory redirects after login

#### Admin approval actions

| Action | Effect |
|---|---|
| Approve | Sets `APPROVED`; sends in-app notification |
| Reject | Sets `REJECTED`; user cannot access features |
| Deactivate | Sets `isActive = false`; invalidates sessions |
| Change role | Updates global role (Admin, Resident, etc.) |

---

### 5.3 Units & Residency

**URLs:** `/admin/units`, `/admin/units/[id]`, `/units/[unitNumber]`, `/directory`

**Unit structure:**
- 3 towers: A, B, C
- 34 floors × 2 units per floor = 204 units
- Naming: `A-0101`, `B-1702`, `C-3402`
- Floors 33–34 may be duplex units

**Admin capabilities:**
- View all units with occupancy status (occupied / vacant)
- Filter by tower and floor
- Assign user to unit with role and date range
- Support multiple owners (joint owners) on one unit
- **Ownership transfer:** atomic operation — close old membership, open new one
- View full membership history per unit

**Resident capabilities:**
- View own unit(s) and role(s) on profile
- Browse **directory** — search by tower; see who lives in each flat (**names only**, no phone/email for privacy)

**Automatic expiry:** Cron job runs hourly; memberships past `endDate` are deactivated.

---

### 5.4 User & Unit Profiles

**URLs:** `/users/[userId]`, `/units/[unitNumber]`

**Global rule:** Every user name and unit number displayed anywhere in the portal links to the respective profile page.

#### User profile sections

| Section | Self | Other resident | Admin |
|---|---|---|---|
| Name, avatar, role | View + edit | View (name, unit, role) | View + admin actions |
| Contact (email, phone) | View + edit | Hidden | View |
| Emergency contact, vehicles | View + edit | Hidden | View |
| Unit memberships | View | View (active only) | View + history |
| Sub-community memberships | View | View | View |
| RWA designation | View | View | View |
| Activity summary (polls, events, tickets) | View | Hidden | View |
| Admin actions (role, deactivate) | — | — | Available |

#### Unit profile sections

| Section | Unit resident | Other resident | Admin |
|---|---|---|---|
| Unit info (tower, floor, type, area) | View | View | View |
| Current residents (linked names) | View | View (names only) | View |
| Dues status | View | Hidden | View |
| Active visitor passes | View | Hidden | View |
| Open tickets | View | Hidden | View |
| Registered vehicles | View | Hidden | View |
| Admin actions (assign, transfer, generate due) | — | — | Available |

---

### 5.5 Notice Board

**URLs:** `/notices`, `/admin/notices/new`

**Purpose:** Official society announcements — water shutoffs, AGM dates, maintenance schedules.

| Field | Description |
|---|---|
| Title | Short headline |
| Body | Rich text content |
| Priority | Normal · Important · Emergency |
| Expiry | Optional auto-hide date |
| Target tower | Optional — notice shown only to residents of Tower A, B, or C |

**Resident experience:** Notices appear on dashboard and hub live feed, sorted by priority then date. Emergency notices are highlighted in red.

**Admin experience:** Create notice via form; emergency email blast to all residents is **Phase 2**.

---

### 5.6 Events & RSVP

**URLs:** `/events`, `/events/new`, `/events/[id]`

**Purpose:** Community gatherings — yoga classes, festivals, AGM, tower meetings.

| Capability | Who |
|---|---|
| Create event (global or sub-community scoped) | Admin, Community Admin |
| View upcoming events | All approved residents |
| RSVP (Accept / Decline / Maybe) | Residents and family members |
| View RSVP counts and attendee list | Event creator, admin |

**Scope:**
- **Global** — visible to all residents
- **Sub-community** — visible to group members only

**Note:** Calendar grid view (month/week) is Phase 2. Current UI is a card list.

---

### 5.7 Polls & Voting

**URLs:** `/polls`, `/polls/new`, `/polls/[id]`

**Purpose:** Community decisions — AGM resolutions, feedback surveys, committee elections.

| Setting | Options |
|---|---|
| Scope | Global (all residents) or sub-community |
| Anonymous voting | Yes / No |
| Result visibility | Live during poll · After poll closes |
| Multi-select | Up to N choices per voter |
| Eligibility | All residents · Owners only · One vote per unit *(stored, not yet enforced)* |
| RWA resolution | Quorum percentage required *(display only)* |

**Voting rules:**
- One vote per user per poll (or up to `maxChoices` for multi-select)
- Cannot change vote after submission
- Polls auto-close at configured end date/time

---

### 5.8 Sub-Communities (Clubs & Groups)

**URLs:** `/communities`, `/communities/[id]`, `/admin/communities`

**Purpose:** Interest-based groups within the society — Sports Club, Garden Club, Book Club, etc.

| Action | Who |
|---|---|
| Create / archive community | Admin |
| Assign community admin | Admin |
| Add / remove members | Community Admin |
| Request to join | Any resident |
| Approve / reject join request | Community Admin |

Each sub-community has its own page with: description, member list, scoped polls, scoped events, and file vault (when enabled).

---

### 5.9 Helpdesk & Ticketing

**URLs:** `/tickets`, `/tickets/new`, `/tickets/[id]`, `/admin/tickets`

**Purpose:** Maintenance and service requests — plumbing, electrical, housekeeping, security.

| Field | Description |
|---|---|
| Category | Plumbing · Electrical · Civil · Housekeeping · Security · Other |
| Priority | Low · Medium · High · Urgent |
| Subject & description | Free text |
| Unit | Auto-linked to resident's unit |

**Workflow:**

```
Resident raises ticket (OPEN)
        │
        ▼
Admin views / assigns (IN_PROGRESS)
        │
        ▼
Assignee adds comments, updates status
        │
        ▼
RESOLVED → CLOSED
```

**Resident:** Track own tickets, add comments, view status timeline.  
**Admin:** View all tickets, filter by status/category, update status.  
**Note:** Photo attachments and ticket assignment to specific users are Phase 2.

---

### 5.10 Facility Booking

**URLs:** `/facilities`, `/facilities/[id]`

**Bookable amenities (seed data):**
- Swimming Pool & Sun Deck
- Rooftop Recreation Center & Sky Deck
- Spa & Wellness Center
- Mini Theatre
- Amphitheater
- Cricket Pitch
- Skating Rink

| Rule | Default |
|---|---|
| Slot duration | 60 minutes |
| Advance booking window | 7 days |
| Max bookings per user | 2 active |
| Cancellation cutoff | 60 minutes before slot |
| Capacity | 1 (exclusive) or N (shared, e.g. pool) |

**Booking flow:**
1. Resident selects facility
2. Views availability grid (open slots shown; blackouts grayed out)
3. Clicks slot → confirms booking
4. Can cancel if > 60 min before start

**Admin:** Create facilities, set blackout periods (maintenance closures).

---

### 5.11 Visitor Management

**URLs:** `/visitors`, `/visitors/new`, `/visitors/[id]`, `/gate`

**Purpose:** Digital gate passes for guests, delivery personnel, daily help, cab drivers.

| Field | Description |
|---|---|
| Visitor name & phone | Required / optional |
| Visitor type | Guest · Delivery · Daily Help · Cab · Other |
| Destination unit | Required — guard sees which flat |
| Validity window | From / until datetime |
| Recurring | Optional — specific days of week (for maids/cooks) |
| Parking slot | Optional |

**On creation:** System generates a **6-digit OTP** and **QR code**.

**Resident actions:**
- Share pass via **WhatsApp** (pre-filled message with OTP and unit)
- View active and past passes
- Cancel pass

**Gate validation (`/gate`):**
- Security enters OTP
- System shows: visitor name, destination unit, pass type, valid/invalid/expired
- Valid pass marked as USED (single-use) or validated (recurring)

**Limits:** Max 10 active passes per resident at any time.

---

### 5.12 Dues & Payments

**URLs:** `/dues`, `/admin/dues`

**Purpose:** Track maintenance charges — **ledger only**, no online payment in v1.

| Resident sees | Admin can do |
|---|---|
| Dues for their unit(s) | Generate dues for all 204 units (bulk) |
| Status: Pending · Paid · Overdue · Waived | Mark individual due as paid |
| Payment history | Attach receipt (file upload) |
| Outstanding total | Financial summary report |

**Reminders:** Cron job marks overdue dues and can trigger notifications (email reminders Phase 2).

**Currency:** Amounts in INR (₹).

---

### 5.13 File Vault

**URL:** `/files`

**Purpose:** Society-wide document storage — bylaws, AGM minutes, registration certificates.

| Rule | Value |
|---|---|
| Max file size | 25 MB |
| Allowed types | PDF, DOCX, XLSX, images |
| Upload | Admin only (global vault) |
| Download | All approved residents |
| Storage | MinIO (S3-compatible), self-hosted |

Sub-community scoped file vaults are supported in schema; global vault is the primary implemented UI.

---

### 5.14 RWA Committee

**URLs:** `/committee`, `/admin/committee`

**Purpose:** Display current office bearers — President, Secretary, Treasurer, Committee Members.

| Field | Description |
|---|---|
| User | Linked to resident profile |
| Title | Office held |
| Term | Start and end dates |

Public page shows current designations. Admin page manages appointments.

---

### 5.15 Notifications

**URL:** `/notifications` (inbox); bell icon in header

**Channels (v1):** In-app only

| Trigger | Notification type |
|---|---|
| Account approved | Approval granted |
| New poll created | New poll |
| New event published | New event |
| Ticket status changed | Ticket update |
| Notice published | Notice published |
| Join request approved | Community join approved |

Unread count shown on bell icon. Mark individual or all as read.

**Phase 2:** Email templates, notification preferences (toggle per category).

---

### 5.16 Admin Tools

**URLs:** `/admin`, `/admin/audit`, `/admin/export`

| Tool | Purpose |
|---|---|
| Admin dashboard | Counts: pending approvals, open tickets, unit onboarding progress |
| Audit log | Filterable log of admin actions (approve user, role change, file delete, etc.) |
| CSV export | Members list, dues report, tickets summary |
| Global search | Cmd+K — search residents by name, units by number |

---

## 6. Business Rules Summary

| # | Rule |
|---|---|
| BR-01 | Every new user account requires admin approval before portal access |
| BR-02 | A user may belong to multiple units with different roles simultaneously |
| BR-03 | Unit membership access expires automatically on `endDate` |
| BR-04 | Family members can view content and raise tickets but cannot vote or book facilities |
| BR-05 | One vote per user per poll (or up to N choices if multi-select enabled) |
| BR-06 | Visitor passes are linked to a destination unit — guard always sees which flat |
| BR-07 | Max 10 active visitor passes per resident |
| BR-08 | Facility bookings prevent double-booking via database constraint |
| BR-09 | Notices can be targeted to a specific tower; untargeted = all residents |
| BR-10 | Dues are per-unit; reminders go to primary contact (`isPrimary = true`) |
| BR-11 | User names and unit numbers are always clickable links to profile pages |
| BR-12 | Directory shows resident names only — no phone or email (privacy) |
| BR-13 | All dates stored in UTC; displayed in IST (Asia/Kolkata) |
| BR-14 | Deactivated users are immediately logged out on next request |
| BR-15 | Ticket SLA: Urgent = 4 hours, High = 24 hours, Medium = 48 hours, Low = 72 hours |
| BR-16 | SLA deadline is computed from ticket `createdAt` + SLA hours for the priority level |
| BR-17 | SLA status displayed on ticket detail: green (ok), amber (warning ≤4h remaining), red (breached) |
| BR-18 | Ticket satisfaction rating (1–5 stars) is only available after ticket status is CLOSED or RESOLVED |
| BR-19 | Poll eligibility enforced: ALL_RESIDENTS = any active membership; OWNERS_ONLY = OWNER or JOINT_OWNER role; ONE_PER_UNIT = one vote per unit regardless of user |
| BR-20 | Emergency notices require acknowledgment before user can access other portal features |
| BR-21 | Domestic help passes auto-generated daily based on `recurrenceDays` schedule |
| BR-22 | Move-out requests block unit access until dues are cleared (status PAID for all PENDING dues) |
| BR-23 | Facility waitlist users are notified when a slot opens; first to confirm gets the booking |
| BR-24 | Security staff PIN login creates a 30-day session; only gate routes accessible |
| BR-25 | Notice body text truncated to 4 lines in list view; full text on detail page |
| BR-26 | Ticket photo attachments max 3 images, max 25MB each, images only |

---

## 7. User Journey Diagrams

### 7.1 Onboarding Journey

```mermaid
flowchart TD
    A[New User visits portal] --> B[Clicks Resident Login]
    B --> C{Has account?}
    C -->|No| D[Sign up via Google/Apple/Email]
    C -->|Yes| E[Sign in]
    D --> F[Account created - PENDING approval]
    E --> G{Account approved?}
    F --> G
    G -->|No| H[See Pending Approval page]
    G -->|Yes| I{Terms accepted?}
    H --> J[RWA admin reviews]
    J -->|Approved| I
    J -->|Rejected| K[Account rejected - contact RWA]
    I -->|No| L[Onboarding: Accept Terms]
    I -->|Yes| M{Unit claimed?}
    L --> M
    M -->|No| N[Onboarding: Claim Unit]
    M -->|Yes| O[Dashboard - full access]
    N --> P[Admin reviews claim]
    P -->|Approved| Q[Unit membership created]
    P -->|Rejected| R[Re-claim or contact RWA]
    Q --> O
```

### 7.2 Visitor Pass Journey

```mermaid
flowchart TD
    A[Resident opens Visitors] --> B[Clicks Create Pass]
    B --> C[Fills: visitor name, type, dates]
    C --> D{Visitor type?}
    D -->|Guest| E[Standard pass with OTP]
    D -->|Delivery| F[Pass with company name]
    D -->|Daily Help| G[Pass linked to DomesticHelp record]
    E --> H[Share OTP via WhatsApp/SMS]
    F --> H
    G --> H
    H --> I[Visitor arrives at gate]
    I --> J[Guard validates OTP/QR]
    J -->|Valid| K[Visitor enters - resident notified]
    J -->|Invalid/Expired| L[Entry denied]
    K --> M[Pass marked as USED]
```

### 7.3 AGM Digital Pack Journey

```mermaid
flowchart TD
    A[RWA Admin creates AGM] --> B[Fills: title, date, location]
    B --> C[Adds resolutions - each becomes a poll]
    C --> D[Uploads agenda document]
    D --> E[AGM event + resolution polls created]
    E --> F[All residents notified]
    F --> G[Residents view AGM details]
    G --> H[Owners vote on resolutions]
    H --> I[Admin monitors quorum dashboard]
    I --> J{Quorum met?}
    J -->|Yes| K[Resolutions pass/fail based on votes]
    J -->|No| L[Quorum not met - adjourn]
    K --> M[Admin uploads meeting minutes]
    M --> N[Minutes published to file vault]
```

### 7.4 Maintenance Ticket Journey

```mermaid
flowchart TD
    A[Resident raises ticket] --> B[Fills: category, priority, subject, description]
    B --> C{Has photos?}
    C -->|Yes| D[Attach 1-3 photos via upload]
    C -->|No| E[Submit ticket]
    D --> E
    E --> F[Ticket created - status OPEN]
    F --> G[SLA clock starts]
    G --> H[Admin assigns ticket]
    H --> I[Assigned person works on issue]
    I --> J{Resolved?}
    J -->|Yes| K[Status changed to RESOLVED]
    J -->|No| L[Add comment - status IN_PROGRESS]
    L --> I
    K --> M[Resident rates satisfaction 1-5]
    M --> N[Ticket closed - SLA metrics tracked]
```

---

## 8. End-User Guide — Residents

### 8.1 Getting started

1. Open the portal URL in your browser
2. Click **Resident Login** on the home page
3. Sign in with **Google**, **Apple**, or **email magic link**
4. Wait for RWA admin to approve your account (you may see a "Pending Approval" message)
5. Once approved, you'll receive an in-app notification
6. Visit your **Profile** to add phone, emergency contact, and vehicle details

### 8.2 Daily tasks — quick reference

| I want to… | Go to… |
|---|---|
| See what's happening | Home (`/`) or Dashboard |
| Read a society notice | Notices |
| Book the pool or theatre | Facilities → select amenity → pick slot |
| Invite a guest | Visitors → New Pass → share OTP via WhatsApp |
| Report a leak / issue | Tickets → New Ticket |
| Check my maintenance bill | Dues |
| Vote in a society poll | Polls → open poll → cast vote |
| RSVP to an event | Events → event detail → Accept/Decline |
| Find who lives in a flat | Directory (filter by tower) |
| Join a club | Communities → Request to Join |
| Download society bylaws | Files |
| See RWA office bearers | Committee |

### 8.3 Creating a visitor pass (step-by-step)

1. Go to **Visitors** → **New Pass**
2. Enter visitor name and phone (optional)
3. Select type: Guest / Delivery / Daily Help / Cab
4. Set validity window (from date/time to until date/time)
5. For daily help: enable **Recurring** and select days (Mon–Sat)
6. Optionally add parking slot
7. Click **Create** — you'll see a 6-digit OTP and QR code
8. Tap **Share via WhatsApp** to send the OTP to your guest
9. Guest shows OTP at the gate; security validates on `/gate`

### 8.4 Booking an amenity (step-by-step)

1. Go to **Facilities**
2. Select amenity (e.g. Swimming Pool)
3. View the weekly availability grid
4. Click an open (green) slot
5. Confirm booking
6. To cancel: go to your bookings → Cancel (must be > 1 hour before slot)

### 8.5 Raising a maintenance ticket (step-by-step)

1. Go to **Tickets** → **New Ticket**
2. Select category (Plumbing, Electrical, etc.)
3. Set priority
4. Write subject and description
5. Submit — ticket number assigned
6. Track progress on **Tickets** page; add comments as needed

---

## 8. End-User Guide — Family Members

Family members (Owner's Family / Tenant's Family) have a **subset** of resident capabilities:

| Can do | Cannot do |
|---|---|
| View notices, events, polls | Vote in polls |
| RSVP to events | Book facilities |
| Raise help tickets | Generate visitor passes (depends on unit role — verify with admin) |
| View own profile | Access admin features |

---

## 9. End-User Guide — Community Admins (Club Leads)

If you are assigned as **Community Admin** of a sub-community (e.g. Sports Club):

| Task | How |
|---|---|
| View your community | Communities → your club |
| Add/remove members | Community detail → Members tab |
| Approve join requests | Admin notification or community page |
| Create club poll | Polls → New → scope = your community |
| Create club event | Events → New → scope = your community |
| Upload club documents | Community files tab (when enabled) |

You cannot manage users, units, or society-wide notices — those are RWA Admin functions.

---

## 10. End-User Guide — Security Staff

**Primary task:** Validate visitor passes at the gate.

1. Open **`/gate`** on the gate tablet/phone
2. Ask visitor for their 6-digit OTP (or scan QR)
3. Enter OTP in the validation field
4. System shows:
   - **Valid:** Visitor name, destination unit, pass type → allow entry
   - **Invalid / Expired:** Deny entry; ask resident to generate new pass

**Note:** Dedicated PIN-based login for security staff is planned for Phase 2. Currently the gate page is open (no login required for validation endpoint).

---

## 11. End-User Guide — RWA Administrators

### 11.1 Admin dashboard (`/admin`)

Overview cards:
- Pending user approvals
- Total units / occupied count
- Open tickets
- Quick links to common tasks

### 11.2 User management (`/admin/users`)

| Task | Steps |
|---|---|
| Approve new resident | Users → Pending tab → Approve |
| Reject registration | Users → Reject |
| Assign role | User detail → Change Role dropdown |
| Deactivate account | User detail → Deactivate |
| Assign to unit | Units → unit detail → Assign Member |

### 11.3 Unit management (`/admin/units`)

| Task | Steps |
|---|---|
| View occupancy | Units → filter by tower/floor |
| Assign resident to unit | Unit detail → Assign (role + dates) |
| Transfer ownership | Unit detail → Transfer Ownership (atomic) |
| View history | Unit detail → Membership Timeline |

**Bulk import:** CSV import of units and residents is Phase 2. Currently use Excel seed script (`prisma/seed-directory.ts`) for initial data load.

### 11.4 Publishing a notice

1. Admin → Notices → New
2. Enter title, body, priority
3. Optionally set expiry and target tower
4. Publish — all matching residents see it immediately

### 11.5 Generating maintenance dues

1. Admin → Dues
2. Enter label (e.g. "Maintenance Q1 2026"), amount, due date
3. Click **Generate for All Units** — creates 204 due records
4. When payment received offline: find due → Mark Paid → attach receipt

### 11.6 Other admin tasks

| Task | Location |
|---|---|
| Create sub-community | Admin → Communities → New |
| Manage RWA committee | Admin → Committee |
| View audit log | Admin → Audit |
| Export member/dues/ticket CSV | Admin → Export |
| Review join requests | Admin → Communities |

---

## 12. Implementation Status & Known Gaps

*For product team and QA — reflects codebase as of July 2026.*

### 12.1 Fully working

Authentication, admin approval, hub home page, dashboard, notices, events + RSVP, polls + voting, tickets + comments, facility booking, visitor passes + gate OTP validation, dues view + admin generation, file vault, sub-communities + join requests, committee page, in-app notifications, audit log, CSV export, global search, user/unit profiles, directory, membership expiry cron.

### 12.2 Partial / gaps

| Gap | Impact | Planned fix |
|---|---|---|
| Onboarding not enforced after login | Users can skip terms acceptance and unit claim | Middleware redirect chain |
| Unit claim admin approval | Users claim units but admin workflow incomplete | Admin UI for `claimStatus` |
| Admin pages lack role guard on page load | Any logged-in user can view `/admin` UI (mutations are protected) | Page-level RBAC check |
| Poll eligibility not enforced | Owners-only / one-per-unit polls don't block ineligible voters | Vote API validation |
| Ticket photo attachments | Residents cannot attach photos to tickets | Upload UI |
| Contact RWA form | Dialog exists; `/api/enquiry` endpoint missing | API route + email |
| Security staff PIN login | Gate validation works; no dedicated guard auth | Phase 2 |
| Email notifications | In-app only | Phase 2 (Resend templates) |
| Calendar grid for events | List view only | Phase 2 (FullCalendar) |
| Facility booking approval | `PENDING_APPROVAL` status unused | Admin approve UI |
| Tenant owner consent (NOC) | Schema field unused | Phase 2 workflow |
| `/admin/notices` list page | Create works; no admin list view | Minor UI gap |
| Privacy / Terms pages | Footer links exist; pages not built | Static pages |

### 12.3 Non-functional requirements (target)

| Category | Target |
|---|---|
| Performance | < 2s page load; Lighthouse ≥ 90 |
| Mobile | Responsive; mobile-first for resident features |
| Security | HTTPS, CSRF (server actions), rate limiting on API |
| Availability | 99.5% uptime target |
| Backup | Daily DB backup, 30-day retention |
| Timezone | IST display, UTC storage |

---

## 13. Product KPIs

| KPI | Target | Measurement | Frequency |
|---|---|---|---|
| **Onboarding completion rate** | ≥ 80% of approved users complete onboarding within 7 days | (users with `termsAcceptedAt` + active membership) / (approved users) | Weekly |
| **Ticket SLA compliance** | ≥ 90% of tickets resolved within SLA (Urgent 4h, High 24h, Medium 48h, Low 72h) | (tickets resolved before SLA deadline) / (total resolved tickets) | Weekly |
| **Poll participation rate** | ≥ 50% of eligible voters cast a vote on active polls | (unique voters on poll) / (eligible users per poll eligibility rule) | Per poll |
| **Dues collection rate** | ≥ 85% of dues paid before due date | (dues marked PAID before dueDate) / (total dues generated) | Monthly |
| **Visitor pass utilization** | ≥ 60% of generated passes are used (USED status) | (passes with status USED) / (total passes generated in period) | Monthly |
| **Facility booking utilization** | ≥ 70% of available slots booked | (booked slots) / (total available slots across all facilities) | Monthly |
| **Notification engagement** | ≥ 40% of notifications read within 24 hours | (notifications read within 24h) / (total notifications sent) | Weekly |
| **Resident satisfaction** | ≥ 4.0 average ticket satisfaction rating | (sum of ratings) / (count of rated tickets) | Monthly |

### 13.1 How to track KPIs

- **Onboarding rate:** Query `User` where `approvalStatus = APPROVED` and divide by users with both `termsAcceptedAt` set AND at least one active `UnitMembership`.
- **SLA compliance:** Use `lib/tickets.ts` helpers (`isSLABreached`) on resolved tickets.
- **Poll participation:** Query `Vote` count per poll against eligible user count.
- **Dues collection:** Query `Due` records where `status = PAID` and `paidAt ≤ dueDate`.
- **Visitor pass utilization:** Query `VisitorPass` records and compare `USED` vs total.
- **Facility booking utilization:** Query `FacilityBooking` slots vs facility capacity × time windows.
- **Notification engagement:** Query `Notification` where `isRead = true` and `createdAt` within 24h.
- **Satisfaction:** Average `satisfactionRating` on `HelpTicket` where `satisfactionRating IS NOT NULL`.

---

## 14. Phase 2 Roadmap (Product Backlog Summary)

> **Full implementation backlog:** [`dev/archive/backlog-product-improvements.md`](../dev/archive/backlog-product-improvements.md) — 52 trackable items (IMP-001–507).  
> **Stakeholder roadmap:** [`product-roadmap.md`](./product-roadmap.md) — quarterly themes, KPIs, and RWA decision log.

| Feature | User benefit |
|---|---|
| Online payments (Razorpay) | Pay maintenance dues in-app |
| Email & SMS notifications | Critical alerts reach residents off-portal |
| Calendar view for events | Visual month/week schedule |
| Ticket photo attachments | Show maintenance issue with photo |
| Poll eligibility enforcement | AGM one-vote-per-unit legally correct |
| Tenant NOC workflow | Owner approves tenant registration |
| Security staff PIN login | Dedicated gate device auth |
| Bulk CSV import | Faster society onboarding |
| Notification preferences | Control what alerts you receive |
| Notice read receipts | Admin knows who saw urgent notices |
| Recurring events | Weekly yoga without manual re-creation |
| Inter-flat messaging | Contact neighbour without sharing phone |

Full deferred list: [`dev/hold-backlog.md`](../dev/hold-backlog.md)

---

## 15. Glossary

| Term | Definition |
|---|---|
| **RWA** | Residents' Welfare Association — the governing body of the society |
| **Unit** | One flat/apartment/villa identified by tower-floor-number (e.g. A-0302) |
| **Membership** | Time-bound link between a user, a unit, and a role (Owner, Tenant, etc.) |
| **Sub-community** | Internal club or group (Sports Club, Book Club) |
| **OTP** | One-time 6-digit passcode for visitor gate entry |
| **Due** | A maintenance charge billed to a unit |
| **Notice** | Official society announcement |
| **Resolution** | Formal poll requiring quorum (AGM decisions) |
| **Primary contact** | Designated member of a unit who receives official communications |
| **Hub** | The community home page (`/`) with shortcuts and live feed |
| **IGBC Platinum** | Indian Green Building Council's highest green certification |

---

## 16. Document History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.1 | 2026-07-05 | System | Updated scope, added KPIs (§13), SLA rules (BR-15–26), personas, user journey diagrams, new module status |
| 1.0 | 2026-07-05 | System | Initial FSD from architecture docs + codebase review |

---

*For technical architecture, see [Architecture](../dev/architecture.md). For development tracking, see [Backlog](../dev/backlog.md).*
