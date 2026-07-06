# Gulshan Dynasty — Hold Backlog

> **Usage:** Deferred items moved from `docs/BACKLOG.md`. These are features that were evaluated and intentionally postponed to a future phase.

**Status Legend:**
- `DEFERRED` — Pushed to a future phase
- `BACKLOG` — Not started (deployment-time tasks)

---

## Sprint-level Deferrals

These items were deferred from their original sprints and may be picked up in future sprints or Phase 2.

### Epic 2: Authentication & User Management

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| E2-S13 | Email notification on approval (React Email template + Resend) | S | DEFERRED | Template: "Welcome to Gulshan Dynasty! Your account has been approved."; triggered in approve server action | Deferred to Sprint 5 (E14-S4) |
| E2-S15 | Security staff PIN-based login for gate devices (C7) | M | DEFERRED | `/gate/login` route; 6-digit PIN entry; validates hashed PIN from `User.staffPin`; creates long-lived session (30 days) | Deferred to Sprint 6 (E8-S7) |

### Epic 3: Units & Time-Bound RBAC

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| E3-S6 | Admin: Bulk import units via CSV upload | M | DEFERRED | `/admin/units/import`; react-dropzone for CSV; parse with `papaparse`; validate against regex `^[ABC]-\d{4}$`; upsert | Deferred to Sprint 3 |
| E3-S7 | Admin: Bulk import residents via CSV (user email + unit + role + dates) | L | DEFERRED | CSV columns: email, name, unitNumber, role, startDate, endDate; create User + UnitMembership; skip existing | Deferred to Sprint 3 |
| E3-S12 | Tenant owner consent workflow (G24): when tenant assigned, owner must approve | L | DEFERRED | On TENANT membership creation: set `ownerConsent=PENDING`; notify unit owners; owner approves via notification link; tenant access blocked until GRANTED | Deferred to Sprint 4 |

### Epic 6: Calendar & Events

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| E6-S2 | Unified calendar view (FullCalendar integration showing all user's relevant events) | L | DEFERRED | `/events`; FullCalendar with month/week/day views; fetch global events + user's sub-community events; color-code by scope | Deferred to Phase 2. Card listing implemented. |

### Epic 14: Notifications & Communication

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| E14-S4 | Email notification templates (approval, new poll, event invite, ticket update, due reminder) | L | DEFERRED | React Email templates in `/emails` folder; consistent branding (logo + gold accent); Resend send helper | Deferred to Phase 2. In-app notifications implemented. |
| E14-S5 | Email batching/throttling (non-urgent batched at 100/hr, emergency bypasses) | M | DEFERRED | Queue system: urgent emails sent immediately; non-urgent added to `EmailQueue` table; cron processes 100/hr | Deferred to Phase 2. |
| E14-S6 | User notification preferences (toggle per category: polls, events, tickets, dues, notices) | M | DEFERRED | `/profile/preferences`; `NotificationPreference` model or JSON field on User; check preferences before sending | Deferred to Phase 2. |

### Epic 8: Visitor Management System (VMS)

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| E8-S8 | Gate validation PWA with offline support (G59) | L | DEFERRED | Service worker caches today's active passes on page load; OTP validation works offline against cache; syncs when online | Deferred to Phase 2. |

### Epic 11: Notice Board & Broadcasts

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| E11-S3 | Emergency notice: trigger email to all approved users immediately (bypass throttle) | M | DEFERRED | On create with `EMERGENCY` priority: bulk-send email to all active+approved users; bypass email queue; use Resend batch API | Deferred to Phase 2. |

### Epic 9: Helpdesk & Ticketing

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| E9-S5 | Admin: Assign ticket to user or sub-community | S | DEFERRED | On ticket detail: assign dropdown (search users or select sub-community); creates notification for assignee | Deferred to Phase 2. |

### Epic 10: Facility Booking

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| E10-S6 | Admin: Approve/reject bookings for facilities with `requiresApproval=true` | M | DEFERRED | Admin notification on new booking request; approve/reject buttons; notification to user on decision | Deferred to Phase 2. PENDING_APPROVAL status in schema. |
| E10-S7 | Admin: Set blackout periods on facility (no bookings during maintenance) | M | DEFERRED | `/admin/facilities/[id]/blackouts`; date range picker + reason; creates FacilityBlackout; booking validation rejects overlapping slots | Deferred to Phase 2. Blackout display implemented. |

---

## Phase 2 Backlog

These items are acknowledged but intentionally deferred beyond v1:

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| P2-01 | Recurring events with RRULE support | L | DEFERRED | |
| P2-02 | Event capacity limits + waitlist | M | DEFERRED | |
| P2-03 | Notice read receipts ("seen by X/Y") | M | DEFERRED | |
| P2-04 | Dues line-item granularity (DueLineItem model) | M | DEFERRED | |
| P2-05 | Payment gateway integration (Razorpay) | XL | DEFERRED | |
| P2-06 | SMS/Push notifications | L | DEFERRED | |
| P2-07 | Move-in/move-out scheduling system | M | DEFERRED | |
| P2-08 | Inter-flat messaging (anonymized contact) | L | DEFERRED | |
| P2-09 | Parking slot swap/rental marketplace | M | DEFERRED | |
| P2-10 | Notification quiet hours (DND) | S | DEFERRED | |
| P2-11 | Multi-tenant SaaS (serve multiple societies) | XL | DEFERRED | |
| P2-12 | Real-time chat/discussion threads | XL | DEFERRED | |
| P2-13 | Full audience targeting for notices (block + floor + role) | M | DEFERRED | |
| P2-14 | "Forgot which email" login helper | S | DEFERRED | |
| P2-15 | Audit log archival to cold storage | S | DEFERRED | |

---

## Deployment-time Tasks

These are operational tasks to be completed at deployment time, not development sprints:

| ID | Description | Complexity | Status | Implementation Pointers | Remarks |
|---|---|---|---|---|---|
| RH-S6 | Backup verification: test restore from pg_dump | S | BACKLOG | Take a dump, drop local DB, restore, verify all data intact; document the runbook | Deployment-time task |
| RH-S7 | Load testing (simulate 50 concurrent users on key flows) | M | BACKLOG | Use `k6` or `autocannon`; test: dashboard load, booking creation (concurrency), poll voting, file upload | Deployment-time task |
| RH-S8 | Production deployment: Coolify setup on Oracle Cloud ARM / Hetzner + DNS + SSL | L | BACKLOG | Final Docker build; Coolify project config; Cloudflare DNS pointing to VM; verify HTTPS; set all env vars | Deployment-time task |

---

## Product Improvements Deferrals

These items were deferred from `docs/tracking/backlog-product-improvements.md` and are intentionally postponed to a future phase.

### P3: Long Horizon (Evaluate After 6 Months Usage)

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| IMP-501 | Native mobile app (React Native / Capacitor wrapper) | XL | DEFERRED | Evaluate PWA sufficiency first |
| IMP-502 | Society marketplace (buy/sell within community) | XL | DEFERRED | Moderation burden; WhatsApp groups exist |
| IMP-503 | Real-time chat / WhatsApp replacement | XL | DEFERRED | High moderation + engagement cost |
| IMP-504 | Hindi UI / i18n for guards and staff | L | DEFERRED | next-intl; translate gate + key flows |
| IMP-505 | CCTV / intercom hardware integration | XL | DEFERRED | Vendor-specific |
| IMP-506 | Biometric gate integration | XL | DEFERRED | Hardware project |
| IMP-507 | Multi-society SaaS mode | XL | DEFERRED | Explicitly out of scope per ARCHITECTURE |

### P1: Governance Deferrals

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| IMP-409 | Tenant NOC workflow — owner consent before tenant access | L | DEFERRED | `ownerConsent` on UnitMembership; block tenant until GRANTED; notify owner on tenant assign |

### P2: Luxury & Admin Deferrals

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| IMP-405 | Razorpay payment gateway integration | XL | DEFERRED | BLOCKED until RWA legal approval |

---

## Summary Statistics

| Category | Count |
|---|---|
| Sprint-level deferrals | 14 |
| Phase 2 items | 15 |
| Deployment-time tasks | 3 |
| Product Improvements deferrals | 9 |
| **Total** | **41** |

---

*Moved from docs/BACKLOG.md on 2026-07-04*
*Original source: docs/tracking/archive/backlog-archived-2026-07-04.md (83 completed items)*
