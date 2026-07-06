# Profile Pages Design — User Profile & Unit Profile

> **Design Principle:** Every user name and unit number in the portal is a **clickable hyperlink** to its respective profile page. This creates a fully navigable, interconnected system.

---

## 1. Global Linking Convention

### Rule: All References are Hyperlinks

Wherever a **user name** or **unit number** appears in the portal — in tables, cards, comments, member lists, audit logs, tickets, passes, or any other context — it MUST be rendered as a clickable link to the respective profile page.

**URLs:**
- User profile: `/users/[userId]`
- Unit profile: `/units/[unitNumber]` (e.g., `/units/A-0101`)

**Reusable Components:**

```tsx
// <UserLink /> — renders a clickable user name anywhere in the app
<UserLink userId="clxyz..." name="Rajesh Sharma" />
// Renders: <a href="/users/clxyz...">Rajesh Sharma</a> with avatar tooltip

// <UnitLink /> — renders a clickable unit badge anywhere in the app
<UnitLink unitNumber="B-1402" />
// Renders: <a href="/units/B-1402" class="badge">B-1402</a> with tower color
```

**Tower Color Coding (for UnitLink badge):**
- Tower A: Gold accent (`#d4af37`)
- Tower B: Teal (`#2dd4bf`)
- Tower C: Rose (`#f43f5e`)

---

## 2. User Profile Page (`/users/[userId]`)

### 2.1 Access Rules

| Viewer Role | What They See |
|---|---|
| **The user themselves** | Full profile (editable) |
| **Any approved resident** | Public profile (name, avatar, unit, role — no phone/email/vehicles) |
| **Admin / Super Admin** | Full profile (read-only) + admin actions |
| **Unauthenticated** | Redirect to login |

### 2.2 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Avatar (large) + Name + Role Badge + Status Badge      │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  ┌─── SECTION: Unit & Residency ──────────────────────────────┐ │
│  │  Current Unit(s):  [A-0302] Owner (since Jan 2024)          │ │
│  │                    [B-1201] Tenant (Mar 2025 – Dec 2025)    │ │
│  │  Tower: A  |  Floor: 3  |  Parking Slots: 2                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── SECTION: Contact & Personal (self/admin only) ──────────┐ │
│  │  Email: rajesh@gmail.com                                     │ │
│  │  Phone: +91 98765 43210                                      │ │
│  │  Emergency Contact: Priya Sharma (+91 99887 76655)           │ │
│  │  Vehicles: DL4CAF1234, UP16AB5678                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── SECTION: Community Memberships ─────────────────────────┐ │
│  │  • Sports Club (Member since Jun 2024)                       │ │
│  │  • Event Committee (Admin since Jan 2025)                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── SECTION: RWA Designation (if applicable) ───────────────┐ │
│  │  🏛️ Secretary — Gulshan Dynasty RWA (2025–2026)             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── SECTION: Activity Summary ──────────────────────────────┐ │
│  │  Polls Participated: 12/15                                   │ │
│  │  Events Attended: 8                                          │ │
│  │  Tickets Raised: 3 (2 resolved, 1 open)                     │ │
│  │  Visitor Passes (this month): 5                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── SECTION: Admin Actions (admin only) ────────────────────┐ │
│  │  [Change Role ▾] [Deactivate] [View Audit Log]              │ │
│  │  Approval Status: ✅ Approved by Admin on 15 Jan 2024       │ │
│  │  Unit Claim: A-0302 (Approved)                               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── SECTION: Membership History (admin only) ───────────────┐ │
│  │  Timeline:                                                    │ │
│  │  ● Jan 2024 – present  | A-0302 | Owner (primary)           │ │
│  │  ● Mar 2023 – Dec 2023 | C-1801 | Tenant                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Data Sources

| Section | Data Source | Query |
|---|---|---|
| Header | `User` table | Name, avatarUrl, globalRole, approvalStatus, isActive |
| Unit & Residency | `UnitMembership` WHERE userId=X AND (endDate IS NULL OR endDate > NOW()) | Active memberships with unit details |
| Contact & Personal | `User` table | Email, phone, emergencyContact*, vehiclePlates* |
| Community Memberships | `CommunityMembership` WHERE userId=X | Sub-communities + role |
| RWA Designation | `Designation` WHERE userId=X AND (endDate IS NULL OR endDate > NOW()) | Current designations |
| Activity Summary | Aggregates from Vote, RSVP, HelpTicket, VisitorPass | Count queries scoped to user |
| Membership History | `UnitMembership` WHERE userId=X ORDER BY startDate DESC | All memberships (including expired) |

### 2.4 Edit Mode (Self-View)

When viewing your own profile, each section has an "Edit" button that opens an inline form or modal:

| Field | Editable by User | Editable by Admin |
|---|---|---|
| Name | ✅ | ✅ |
| Avatar | ✅ | ✅ |
| Phone | ✅ | ✅ |
| Email | ❌ (tied to auth provider) | ❌ |
| Emergency Contact | ✅ | ✅ |
| Vehicle Plates | ✅ | ✅ |
| Unit Membership | ❌ | ✅ |
| Global Role | ❌ | ✅ |
| Approval Status | ❌ | ✅ |
| Community Memberships | ❌ (request to join) | ✅ |
| Designation | ❌ | ✅ |

---

## 3. Unit Profile Page (`/units/[unitNumber]`)

### 3.1 Access Rules

| Viewer Role | What They See |
|---|---|
| **Current resident of this unit** | Full unit profile |
| **Any approved resident** | Unit number, tower, floor, type, current resident names (no contact details) |
| **Admin / Super Admin** | Full unit profile + admin actions + history |
| **Unauthenticated** | Redirect to login |

### 3.2 Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Unit Badge [A-0302] + Tower A + Floor 3                │
│  Type: 4 BHK Apartment  |  Area: 2783 sq.ft  |  Parking: 2     │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  ┌─── SECTION: Current Residents ─────────────────────────────┐ │
│  │                                                              │ │
│  │  👤 Rajesh Sharma — Owner (Primary) — since Jan 2024        │ │
│  │  👤 Priya Sharma — Owner Family — since Jan 2024            │ │
│  │  👤 Amit Sharma — Owner Family — since Jan 2024             │ │
│  │                                                              │ │
│  │  (Names are hyperlinks to /users/[id])                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── SECTION: Dues Status ───────────────────────────────────┐ │
│  │  Outstanding: ₹15,000 (2 pending)                            │ │
│  │  Last Paid: Maintenance Q4 2025 — ₹7,500 on 28 Dec 2025    │ │
│  │  [View All Dues →]                                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── SECTION: Visitor Passes (Active) ───────────────────────┐ │
│  │  • Ramesh (Daily Help) — Mon–Sat — valid till 31 Jul 2026  │ │
│  │  • Amazon Delivery — today 2:00–6:00 PM                     │ │
│  │  [View All Passes →]                                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── SECTION: Open Tickets ──────────────────────────────────┐ │
│  │  • #T-0042 Plumbing — Bathroom leak (In Progress)           │ │
│  │  [View All Tickets →]                                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── SECTION: Vehicles Registered ──────────────────────────-┐ │
│  │  🚗 DL4CAF1234 (Rajesh Sharma)                              │ │
│  │  🚗 UP16AB5678 (Rajesh Sharma)                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── SECTION: Admin Actions (admin only) ────────────────────┐ │
│  │  [Assign Resident] [Transfer Ownership] [Generate Due]       │ │
│  │  [View Membership History]                                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─── SECTION: Membership History (admin only) ───────────────┐ │
│  │  Timeline (chronological):                                    │ │
│  │  ● Jan 2024 – present  | Rajesh Sharma | Owner (Primary)    │ │
│  │  ● Jan 2024 – present  | Priya Sharma  | Owner Family       │ │
│  │  ● Jun 2022 – Dec 2023 | Previous Owner| Owner              │ │
│  │  ● Jan 2021 – May 2022 | First Owner   | Owner              │ │
│  │                                                              │ │
│  │  (All names are hyperlinks to /users/[id])                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Data Sources

| Section | Data Source | Query |
|---|---|---|
| Header | `Unit` table | unitNumber, block, floor, unitType, areaSqFt, parkingSlots |
| Current Residents | `UnitMembership` WHERE unitId=X AND (endDate IS NULL OR endDate > NOW()) | Active members with User join |
| Dues Status | `Due` WHERE unitId=X ORDER BY dueDate DESC | Aggregates + latest records |
| Visitor Passes | `VisitorPass` WHERE unitId=X AND status=ACTIVE | Active passes |
| Open Tickets | `HelpTicket` WHERE unitId=X AND status IN (OPEN, IN_PROGRESS) | Open/in-progress tickets |
| Vehicles | `User.vehiclePlates` for all active members of this unit | Flatten from all current residents |
| Membership History | `UnitMembership` WHERE unitId=X ORDER BY startDate DESC | All memberships (including expired) |

### 3.4 Visibility Matrix (What Each Role Sees on Unit Profile)

| Section | Unit Resident (self) | Other Resident | Admin |
|---|---|---|---|
| Header (unit info) | ✅ | ✅ | ✅ |
| Current Residents (names) | ✅ | ✅ (names only) | ✅ (full details) |
| Dues Status | ✅ | ❌ | ✅ |
| Visitor Passes | ✅ | ❌ | ✅ |
| Open Tickets | ✅ | ❌ | ✅ |
| Vehicles | ✅ | ❌ | ✅ |
| Admin Actions | ❌ | ❌ | ✅ |
| Membership History | ❌ | ❌ | ✅ |

---

## 4. Component Specification

### 4.1 `<UserLink />` Component

```tsx
interface UserLinkProps {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  showAvatar?: boolean;  // default: false (just name link)
  size?: "sm" | "md";    // avatar size
}
```

**Rendering:**
- Default: just the name as a styled hyperlink (underline on hover, gold accent color)
- With `showAvatar=true`: small circular avatar + name
- Tooltip on hover: shows role badge + unit number (if available)

**Usage locations:**
- Audit log table (who performed action)
- Ticket comments (author)
- Unit membership lists (resident names)
- Poll voters list (non-anonymous)
- RSVP attendee list
- Notification "from" fields
- Community member lists
- Admin user tables

### 4.2 `<UnitLink />` Component

```tsx
interface UnitLinkProps {
  unitNumber: string;  // e.g., "A-0302"
  showTower?: boolean; // default: true (show tower color badge)
}
```

**Rendering:**
- Inline badge with tower-colored background: `[A-0302]`
- Tower A = gold badge, Tower B = teal badge, Tower C = rose badge
- Clicking navigates to `/units/A-0302`

**Usage locations:**
- User profile (unit section)
- Directory listing
- Ticket details (which unit raised it)
- Visitor pass details (destination unit)
- Dues table (which unit owes)
- Admin unit management table
- Membership assignment forms
- Audit log entries (when entity is a unit)

### 4.3 `<MembershipTimeline />` Component

Shared between User Profile and Unit Profile for showing membership history.

```tsx
interface MembershipTimelineProps {
  memberships: {
    id: string;
    user: { id: string; name: string; avatarUrl?: string };
    unit: { unitNumber: string };
    role: UnitRole;
    startDate: Date;
    endDate?: Date | null;
    isPrimary: boolean;
  }[];
  perspective: "user" | "unit";  // "user" shows units; "unit" shows people
}
```

**Rendering:**
- Vertical timeline with dots and connecting lines
- Active memberships highlighted (no endDate or endDate > today)
- Expired memberships grayed out
- Each entry shows the hyperlinked counterpart (if perspective=user → show UnitLink; if perspective=unit → show UserLink)

---

## 5. Route Structure

```
/users/[userId]          → User profile (public view for residents, full for self/admin)
/users/[userId]/edit     → Edit own profile (redirect if not self)
/units/[unitNumber]      → Unit profile (scoped visibility per role)

/admin/users/[userId]    → Redirects to /users/[userId] (admin sees admin actions there)
/admin/units/[unitNumber]→ Redirects to /units/[unitNumber] (admin sees admin actions there)
```

**No separate admin profile pages** — the same `/users/[id]` and `/units/[unitNumber]` pages render admin-specific sections conditionally based on the viewer's role. This avoids duplicate pages and ensures a single source of truth.

---

## 6. Backlog Items for Profile Pages

| ID | Description | Sprint | Complexity |
|---|---|---|---|
| PROF-S1 | Build `<UserLink />` reusable component with hover tooltip | Sprint 2 | S |
| PROF-S2 | Build `<UnitLink />` reusable component with tower color badge | Sprint 2 | S |
| PROF-S3 | Build `<MembershipTimeline />` shared component | Sprint 2 | M |
| PROF-S4 | Build User Profile page — public view (header, unit, communities, designation) | Sprint 2 | L |
| PROF-S5 | Build User Profile page — self-edit mode (inline forms for editable fields) | Sprint 2 | M |
| PROF-S6 | Build User Profile page — admin sections (actions, history, full details) | Sprint 2 | M |
| PROF-S7 | Build Unit Profile page — resident view (header, residents, dues, passes, tickets) | Sprint 2 | L |
| PROF-S8 | Build Unit Profile page — admin sections (actions, transfer, history) | Sprint 2 | M |
| PROF-S9 | Retrofit all existing components to use `<UserLink />` and `<UnitLink />` wherever names/units appear | Sprint 2 | M |

---

## 7. Search & Navigation to Profiles

**Global search (Command Palette — `Cmd+K`):**
- Typing a name → shows matching users
- Typing a unit number (e.g., "B-14") → shows matching units
- Selecting a result navigates to the profile page

**Directory page (`/directory`):**
- All units listed with their residents
- Every unit number → `<UnitLink />`
- Every resident name → `<UserLink />`

**Breadcrumb trail example:**
```
Dashboard > Units > A-0302 > Rajesh Sharma
```

---

*Last updated: 2026-07-04*
