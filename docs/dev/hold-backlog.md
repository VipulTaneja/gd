# Gulshan Dynasty — Hold Backlog

> **Usage:** Deferred items moved from `backlog.md`. These are features that were evaluated and intentionally postponed to a future phase.

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
| E3-S12 | Tenant owner consent workflow (G24): when tenant assigned, owner must approve | L | DEFERRED | On TENANT membership creation: set `ownerConsent=PENDING`; notify unit owners; owner approves via notification link; tenant access blocked until GRANTED | Deferred to Sprint 4 · coordinates with [`backlog-delegated-leadership.md`](backlog-delegated-leadership.md) **UL-028** |

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

These items were deferred from `tracking/backlog-product-improvements.md` and are intentionally postponed to a future phase.

### P3: Long Horizon (Evaluate After 6 Months Usage)

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| IMP-501 | Native mobile app (React Native / Capacitor wrapper) | XL | DEFERRED | Evaluate PWA sufficiency first |
| IMP-502 | Society marketplace (buy/sell within community) | XL | DEFERRED | Moderation burden; WhatsApp groups exist |
| IMP-503 | Real-time chat / WhatsApp replacement | XL | DEFERRED | High moderation + engagement cost |
| IMP-504 | Hindi UI / i18n for guards and staff | L | DEFERRED | next-intl; translate gate + key flows |
| IMP-505 | CCTV / intercom hardware integration | XL | DEFERRED | Vendor-specific |
| IMP-506 | Biometric gate integration | XL | DEFERRED | Hardware project |
| IMP-507 | Multi-society SaaS mode | XL | DEFERRED | Explicitly out of scope per architecture docs |

### P1: Governance Deferrals

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| IMP-409 | Tenant NOC workflow — owner consent before tenant access | L | DEFERRED | `ownerConsent` on UnitMembership; block tenant until GRANTED; notify owner on tenant assign |

### P2: Luxury & Admin Deferrals

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| IMP-405 | Razorpay payment gateway integration | XL | DEFERRED | BLOCKED until RWA legal approval |

---

## UI/UX & Forum Deferred Items

These items were moved from `backlog.md` on 2026-07-06. They require manual testing, E2E infrastructure, or high-complexity implementation.

### Manual QA & Performance (require Lighthouse + device testing)

| ID | Description | Complexity | Impact | Status | Implementation Pointers |
|---|---|---|---|---|---|
| CAS-039 | Performance — ensure animations don't hurt LCP/CLS | Low | Medium | DEFERRED | Run Lighthouse on `/`; check CLS on hub shortcuts; verify `next/image` with proper dimensions |
| CAS-040 | Guest vs resident QA matrix | Low | Medium | DEFERRED | Manual checklist: verify 8 shortcuts, badge counts, tower-filtered notices, auth-aware hrefs |
| HUB-S15 | Guest vs resident QA matrix (duplicate of CAS-040) | Low | Medium | DEFERRED | Merge with CAS-040 |
| HUB-S16 | Performance check — Lighthouse ≥90 on hub | Low | High | DEFERRED | Run Lighthouse; verify no carousel in LCP; check `next/image` optimization |
| FORUM-062 | Mobile QA pass (375px) | Medium | Medium | DEFERRED | Manual: verify composer sticky, long threads, image upload, scroll |

### E2E Tests (need Playwright setup)

| ID | Description | Complexity | Impact | Status | Implementation Pointers |
|---|---|---|---|---|---|
| CAS-042 | Screenshot regression — Playwright visual snapshots | Medium | Low | DEFERRED | Install `@playwright/test`; create `e2e/visual/`; write snapshot tests for 8 routes |
| FORUM-063 | E2E smoke test: create thread → reply → report | Medium | Medium | DEFERRED | Create `e2e/forum-smoke.spec.ts`; steps: login → create → reply → report |

### Server Refactor (low impact, optional)

| ID | Description | Complexity | Impact | Status | Implementation Pointers |
|---|---|---|---|---|---|
| FORUM-019 | Server actions — forum routes still REST | Medium | Low | DEFERRED | Audit forum API routes; convert POST endpoints to server actions; keep GET as route handlers |

### High Complexity Features

| ID | Description | Complexity | Impact | Status | Implementation Pointers |
|---|---|---|---|---|---|
| FORUM-053 | @mention parsing + notification | High | Medium | DEFERRED | Install TipTap mention extension; configure user search; parse mentions server-side; create notifications; render as links |
| FORUM-054 | Weekly digest email | High | Low | DEFERRED | Create weekly cron; query top threads; build React Email template; send via Resend; add opt-out preference |

---

## Staff Registry & Contacts Deferred Items

Moved from `backlog-staff-registry.md` on 2026-07-07.

### Staff — On Hold (28 items)

| ID | Description | Priority | Status |
|---|---|---|---|
| STAFF-025 | Society-scoped associations (scope = SOCIETY) — guards, facility | P1 | ON HOLD |
| STAFF-028 | Gate: "On duty today" panel for society staff | P1 | ON HOLD |
| STAFF-030 | Admin CSV export — active staff roster | P2 | ON HOLD |
| STAFF-031 | Clarify admin UI copy: Gate login users vs Staff registry | P1 | ON HOLD |
| STAFF-037 | Optional ID fields on StaffPerson (last-4 Aadhaar, police verify date) | P2 | ON HOLD |
| STAFF-038 | Photo upload for staff (MinIO) — resident + admin | P1 | ON HOLD |
| STAFF-039 | Validation: warn if same phone registered with conflicting name | P2 | ON HOLD |
| STAFF-041 | Unit leader can view (not edit) household staff for led unit | P2 | ON HOLD |
| STAFF-045 | Short-term unit association for electrician/plumber visit (≤7 days) | P2 | ON HOLD |
| STAFF-046 | /contacts — cross-link "Regular help" vs vendor contacts | P2 | ON HOLD |
| STAFF-047 | "Request vendor visit" → pre-filled ticket or one-day pass | P2 | ON HOLD |
| STAFF-048 | Global search: staff names → /staff/[id] | P1 | ON HOLD |
| STAFF-049 | Hub widget: help expected today (count) | P2 | ON HOLD |
| STAFF-051 | Notify resident 3 days before association endDate | P2 | ON HOLD |
| STAFF-052 | FriendlyBadge mapping for staff association status | P2 | ON HOLD |
| STAFF-054 | Seed v2 sample data (multi-unit maid, society guard) | P2 | ON HOLD |
| STAFF-077 | Notify all active unit members when staff associated or ended | P1 | ON HOLD |
| STAFF-078 | Review policy doc: defamation, dispute process, society staff moderation | P1 | ON HOLD |
| STAFF-085 | Admin queue: associations flagged when unit has zero active members | P2 | ON HOLD |
| STAFF-090 | Detect vacant units (cron or on membership end): set needsReview | P2 | ON HOLD |
| STAFF-020 | Deprecate DomesticHelp after migration | P1 | ON HOLD |

### Staff — Deferred (4 items)

| ID | Description | Notes |
|---|---|---|
| STAFF-D01 | Staff portal login (NON_RESIDENT or dedicated role) | Needs product decision |
| STAFF-D02 | Hindi gate UI | hold-backlog.md IMP-504 |
| STAFF-D03 | Vendor marketplace / in-app booking | hold-backlog.md vendor directory |
| STAFF-D04 | Attendance / shift scheduling for guards | Phase 3+ society ops |

### Contacts — On Hold (6 items)

| ID | Description | Priority | Status |
|---|---|---|---|
| CONT-025 | Seed sample reviews in prisma/seed-contacts.ts | P2 | ON HOLD |
| CONT-026 | Admin hide/unhide review; recalc aggregate | P1 | ON HOLD |
| CONT-027 | Audit: CONTACT_REVIEW_CREATED, CONTACT_REVIEW_HIDDEN | P2 | ON HOLD |
| CONT-028 | Global search → /contacts/[id] | P1 | ON HOLD |
| CONT-030 | Review policy doc (defamation, disputes) | P2 | ON HOLD |
| CONT-031 | Hub widget: top-rated contacts | P2 | ON HOLD |

### Contacts — Deferred (3 items)

| ID | Description | Notes |
|---|---|---|
| CONT-D01 | "Request visit" → ticket | See STAFF-047 |
| CONT-D02 | Vendor marketplace | hold-backlog.md |
| CONT-D03 | Photo/logo upload | MinIO; post-MVP |

---

## FAQ Deferred Items

Moved from `backlog-faq.md` on 2026-07-07.

### FAQ — On Hold (2 items)

| ID | Description | Priority | Status |
|---|---|---|---|
| FAQ-045 | Draft preview on public URL (?preview=1 + session) | P2 | ON HOLD |
| FAQ-060 | Global search → FAQ entries (SRCH-*) | P2 | ON HOLD |

### FAQ — Deferred (1 item)

| ID | Description | Notes |
|---|---|---|
| FAQ-061 | View analytics (popular questions) | P3; post-MVP |

### FAQ — Shipped (2026-07-07)

| ID | Description | Status |
|---|---|---|
| FAQ-029 | Rate limit write routes (~30/min/user) | DONE |
| FAQ-033 | Open Graph + optional FAQPage JSON-LD | DONE |
| FAQ-044 | Reorder UI — up/down buttons | DONE |

---

## Summary Statistics

| Category | Count |
|---|---|
| Sprint-level deferrals | 14 |
| Phase 2 items | 15 |
| Deployment-time tasks | 3 |
| Product Improvements deferrals | 9 |
| UI/UX & Forum deferred | 10 |
| Staff Registry deferrals | 32 |
| Contacts deferrals | 9 |
| FAQ deferrals | 6 |
| **Total** | **98** |

---

*Moved from backlog.md on 2026-07-04*
*Original source: archive/backlog-archived-2026-07-04.md (83 completed items)*
