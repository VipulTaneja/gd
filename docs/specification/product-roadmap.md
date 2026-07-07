# Gulshan Dynasty Community Portal — Product Roadmap

**Document type:** Product Roadmap (stakeholder view)  
**Version:** 1.2  
**Date:** 7 July 2026  
**Audience:** RWA committee, product team, residents (summary sections)  
**Related docs:** [Specification index](./README.md) · [Functional Spec](./functional-spec.md) · [Roles & Permissions](./roles-and-permissions.md) · [Dev backlog](../dev/backlog.md)

---

## 1. Vision

**Make Gulshan Dynasty the best-run gated community in Noida** — where residents handle daily life in minutes, the RWA governs transparently, and security operations run smoothly from a single portal.

This is a **resident community platform**, not a property sales website. It is built for the 204 families who already live here.

| Principle | What it means |
|---|---|
| **Resident-first** | Features solve daily friction (visitors, packages, amenities, tickets) |
| **Transparent governance** | AGMs, polls, audit logs, and notices are fair and traceable |
| **Privacy by design** | Directory shows names only; contact details are never public |
| **Zero SaaS lock-in** | Self-hosted; RWA owns all data; no per-flat subscription fees |
| **Right-sized for 204 homes** | Simple beats enterprise; we don't copy every MyGate feature |

---

## 2. Where We Are Today (v1 — Shipped)

The portal is **live and functional** for core society operations.

**Authoritative shipped list:** [Functional Spec §13.1](./functional-spec.md#131-shipped--stable) (modules, gaps, NFR targets).

**v1 gaps fixed:** Onboarding, AGM rules, admin security, ticket photos, daily-life features, staff/contacts reputation systems, and Help & FAQ are implemented.

---

## 2.1 July 2026 — Staff Registry & Reputation (Shipped)

**Theme:** *Stop registering the same maid three times.*

The biggest Q3 delivery after launch stabilization:

| Initiative | Who benefits | What shipped | Backlog |
|---|---|---|---|
| **Staff Registry v2** | All residents | `StaffPerson` + associations; search-first; `/staff` Regular Help; profiles + reviews; society vs unit roles | STAFF-010–095 (47 done) |
| **Gate pass linkage** | Guards | Cron-generated `DAILY_HELP` passes with `staffPersonId`; multi-unit display at gate | STAFF-019, STAFF-081 |
| **Important Contacts v2** | Residents | `/contacts/[id]` detail pages; community reviews; ContactLink pattern | CONT-010–024 (19 done) |
| **Mobile polish** | Phone users | Facilities day-picker booking; directory single-tower on narrow screens | Ad-hoc |

**Humorous but true product rule:** Guards belong to GD, not your flat. Society roles (Guard, Facility, Electrician, Plumber) are visible to everyone but not “addable” to C-1702.

---

## 2.2 Next Up — On Hold & Ideas (Q3–Q4 2026)

Items discovered during staff/contacts implementation — not committed until RWA prioritizes:

| Idea | Benefit | Effort | Backlog ID |
|---|---|---|---|
| Staff + contacts in Cmd+K | Find people and vendors from anywhere | M | STAFF-048, CONT-028, SRCH-* |
| Hub widget: “Help expected today” | Home-screen glance at gate traffic | S | STAFF-049 |
| Hub widget: top-rated contacts | Surface trusted vendors | S | CONT-031 |
| Staff photo upload (MinIO) | Guard recognizes faces, not just initials | M | STAFF-038 |
| Orphan staff admin queue | Clean up when flat goes vacant | M | STAFF-085, STAFF-090 |
| Notify unit on staff add/remove | “Priya added Kamla to C-302” | S | STAFF-077 |
| Admin merge duplicate staff | Same phone, two records — merge | M | STAFF-071 |
| Short-term trades visit (≤7 days) | Electrician for one visit without permanent link | M | STAFF-045 |
| Dues UPI block mobile layout | Treasurer QR readable on phone | S | Mobile audit |
| Review moderation policy | Defamation / dispute process doc | S | STAFF-078, CONT-030 |
| Hindi gate UI | Guards prefer Hindi labels | L | IMP-504 |
| Global search remaining entities | Forums, files, lost & found in Cmd+K | M | SRCH-014–050 |

**Deferred product bets (Phase 3+):** Staff portal login (`NON_RESIDENT`), attendance/shift scheduling for guards, vendor marketplace with in-app booking (STAFF-D03).

---

## 3. Roadmap Overview

```
2026 Q3          2026 Q4          2027 Q1          2027 Q2          2027 H2+
────────         ────────         ────────         ────────         ────────
 STABILIZE    →   DAILY LIFE   →   GOVERN      →   POLISH       →   EVALUATE
 (Phase 0)        (Phase 1A)       (Phase 1B)       (Phase 2)        (Phase 3)

 Fix v1 gaps     Help, delivery,   Emergency,      Dues PDF,        Native app?
 Launch ready    parking, moves    AGM, SLAs       pets, vendors    Payments?
```

---

## 4. Product KPIs (How We Measure Success)

Operational KPI definitions (SLA compliance, poll participation, dues collection, etc.): **[Functional Spec §14](./functional-spec.md#14-product-kpis)**.

Stakeholder rollout targets:

| KPI | Baseline (launch) | 6-month target | 12-month target |
|---|---|---|---|
| Units onboarded | 0 / 204 | 150 / 204 (74%) | 190 / 204 (93%) |
| Monthly active residents | — | 40% of approved users | 60% |
| Visitor passes / week | — | 50+ | 100+ |
| Ticket avg resolution (Medium) | — | < 48 hours | < 36 hours |
| Poll participation (society-wide) | — | > 30% of units | > 50% for AGM |
| Dues collection (within 30 days of due date) | — | > 70% | > 85% |
| Emergency notice ack time | — | 80% within 4 hours | 95% within 2 hours |

*KPIs will be reviewed quarterly with the RWA committee.*

---

## 5. Quarterly Roadmap

### Q3 2026 — Stabilize & Launch (Phase 0)

**Theme:** *Trust the foundation.*

**Goal:** Fix v1 gaps, onboard first 50 units, train admin and gate staff.

**Status: COMPLETED**

| Initiative | Resident / RWA benefit | Backlog IDs | Status |
|---|---|---|---|
| Enforced onboarding | New residents complete terms + unit claim; admin approves | IMP-001, IMP-002 | **DONE** |
| AGM-ready voting | One vote per unit; owners-only polls enforced | IMP-003 | **DONE** |
| Secure admin area | Only RWA admins see admin pages | IMP-004 | **DONE** |
| Ticket photos | Attach leak/damage photos to maintenance requests | IMP-005 | **DONE** |
| Working contact form | Reach RWA from home page | IMP-006 | **DONE** |
| Privacy & terms pages | Legal compliance for portal use | IMP-007 | **DONE** |
| Admin notices list | View and manage published notices | IMP-008 | **DONE** |
| Hub vs Dashboard clarity | Quick Home link added to sidebar | IMP-009 | **DONE** |
| Launch readiness dashboard | Admin sees onboarding progress (X/204 units) | IMP-010 | **DONE** |

**Outcome:** Portal ready for phased resident rollout.

---

### Q4 2026 — Daily Life (Phase 1A)

**Theme:** *Stop repeating yourself every day.*

**Goal:** Remove the biggest daily frictions — domestic help, deliveries, parking, moving flats.

**Status: COMPLETED**

| Initiative | Who benefits | What changes | Status |
|---|---|---|---|
| **Regular Help Registry** | All residents | Register maid/cook once; auto-valid gate entry Mon–Sat | **DONE** |
| **Delivery & packages** | Residents + guards | Guard logs package → resident notified to collect | **DONE** |
| **Parking registry** | Residents + admin | Vehicles linked to units; visitor parking on pass | **DONE** |
| **Move-in / move-out** | Owners + admin | Structured flat handover; dues + keys checklist | **DONE** |

**Backlog IDs:** IMP-101–116

**Outcome:** Daily gate and household operations mostly digital; reduced WhatsApp/calls to guards.

---

### Q1 2027 — Govern & Communicate (Phase 1B)

**Theme:** *Run the society properly.*

**Goal:** Emergency readiness, compliant AGMs, accountable maintenance, reliable alerts.

**Status: COMPLETED**

| Initiative | Who benefits | What changes | Status |
|---|---|---|---|
| **Emergency broadcast** | All residents | One-click fire/water/security alert; must acknowledge | **DONE** |
| **AGM Digital Pack** | RWA + owners | Event + resolution polls + quorum dashboard + minutes archive | **DONE** |
| **Ticket SLAs** | Residents + admin | "Expected response by…" on tickets; overdue escalations | **DONE** |
| **Visitor arrival alert** | Residents | "Your guest has arrived" when guard validates OTP | **DONE** |
| **Notification preferences** | All residents | Control which categories send alerts | **DONE** |
| **Gate PIN login** | Security staff | Dedicated gate tablet login (no personal Google account) | **DONE** |

**Backlog IDs:** IMP-201–211, IMP-301–306

**Outcome:** RWA can run AGMs and emergencies through the portal with confidence and audit trail.

---

### Q2 2027 — Polish & Differentiate (Phase 2)

**Theme:** *Worthy of an IGBC Platinum community.*

**Goal:** Treasurer tools, booking excellence, community life features that match Gulshan Dynasty's positioning.

**Status: PARTIALLY COMPLETED**

| Initiative | Who benefits | What changes | Status |
|---|---|---|---|
| **Dues with UPI QR** | Treasurer + residents | Scan to pay (offline) | **DONE** |
| **Defaulter aging report** | Treasurer | Who owes 30/60/90 days — one click | **DONE** |
| **Booking waitlist** | Residents | Join queue when pool slot full | **DONE** |
| **Banquet hall approval** | Admin + residents | Clubhouse bookings need RWA sign-off | **DONE** |
| **Post-ticket ratings** | Admin | Service quality trends | **DONE** |
| **Lost & found** | Residents | Community bulletin, less WhatsApp noise | **DONE** |
| **Pet registration** | Residents + security | Pets on file per unit | **DONE** |
| **Facility usage analytics** | Admin | Booking trends and peak hours | **DONE** |
| **GST PDF receipts** | Treasurer + residents | Downloadable GST receipt | **BLOCKED** (needs RWA GSTIN) |
| **Vendor directory** | Residents | RWA-approved plumber, electrician list | **DEFERRED** |
| **Event calendar view** | Residents | Month/week visual schedule | **DEFERRED** |
| **Sustainability page** | All | IGBC story, farm club, green living | **DEFERRED** |

**Backlog IDs:** IMP-401–404, IMP-406–417

**Outcome:** Portal feels complete for a luxury society; treasurer workflow mostly paperless.

---

### H2 2027+ — Evaluate (Phase 3)

**Theme:** *Data-driven next steps.*

We will **not commit** to these until 6 months of usage data:

| Feature | Decision criteria |
|---|---|
| **Online payments (Razorpay)** | RWA legal approval + treasurer ready for reconciliation |
| **Native mobile app** | Only if PWA usage data shows mobile gap |
| **SMS for all alerts** | Budget approved; emergency SMS proven valuable |
| **Society marketplace** | Resident demand; moderation capacity |
| **Hindi UI** | Guard and staff feedback |
| **Chat / messaging** | Only if inter-flat contact requests insufficient |

**Backlog IDs:** IMP-405, IMP-501–507

---

## 6. Feature Priorities — Top 10 for RWA Committee

Ranked by resident impact × feasibility:

| Rank | Feature | Quarter | Why | Status |
|---|---|---|---|---|
| 1 | Fix onboarding + unit claim approval | Q3 2026 | Can't onboard residents without this | **DONE** |
| 2 | AGM vote rules (one vote per unit) | Q3 2026 | Legal compliance | **DONE** |
| 3 | Regular Help Registry | Q4 2026 | #1 daily pain for every household | **DONE** |
| 4 | Delivery & package notifications | Q4 2026 | #1 gate friction | **DONE** |
| 5 | Emergency broadcast + acknowledgment | Q1 2027 | Safety expectation | **DONE** |
| 6 | AGM Digital Pack | Q1 2027 | Next AGM ready | **DONE** |
| 7 | Ticket SLAs | Q1 2027 | Maintenance accountability | **DONE** |
| 8 | Gate PIN login | Q1 2027 | Security staff usability | **DONE** |
| 9 | Dues UPI QR | Q2 2027 | Treasurer efficiency | **DONE** |
| 10 | GST PDF receipts | Q2 2027 | Professional receipts | **BLOCKED** |

---

## 7. Personas & What They Get Each Quarter

| Persona | Q3 | Q4 | Q1 | Q2 |
|---|---|---|---|---|
| **Owner / Resident** | Stable portal, photo tickets | Help registry, packages, parking | Emergency alerts, AGM vote, SLAs | UPI dues, lost & found, pets |
| **Family member** | Same as resident | Package notifications | Event emails, notifications | — |
| **RWA Admin** | Launch dashboard, secure admin | Move workflows, parking registry | AGM pack, SLAs, emergency broadcast | Defaulter reports, facility analytics |
| **Treasurer** | Dues ledger works | — | Email due reminders, UPI QR | Aging reports, facility analytics |
| **Security guard** | Gate OTP works | Staff list at gate, delivery logging | PIN login, arrival alerts | Offline gate (evaluate) |
| **Community club lead** | Clubs work today | — | — | — |

---

## 8. What We Are NOT Building (And Why)

| Feature | Why not (for now) |
|---|---|
| Property sales / marketing pages | Different product — gulshandynasty.com handles this |
| WhatsApp-style group chat | WhatsApp already used; moderation burden |
| Multi-society SaaS | Single community focus; avoid complexity |
| Payment gateway (initially) | UPI QR achieves 80% value; Razorpay needs legal/compliance |
| CCTV / intercom integration | Hardware-dependent; vendor lock-in |
| Full Hindi app | English-first; evaluate for gate staff after PIN login |
| AI chatbot | Over-engineering for 204 units |

---

## 9. Competitive Positioning

Residents may compare us to **MyGate, NoBrokerHood, or ADDA**. Our deliberate advantages:

| Dimension | Commercial apps | Gulshan Dynasty Portal |
|---|---|---|
| Cost | ₹50–200/unit/month | **₹0** (self-hosted) |
| Data ownership | Vendor holds data | **RWA owns all data** |
| Customization | Generic for all societies | **Built for 204 units, 3 towers, our amenities** |
| Governance | Basic polls | **AGM quorum, resolutions, audit log** |
| Sales/marketing | Often bundled | **None — pure resident portal** |

We win on **governance, privacy, and community-specific UX** — not feature count.

---

## 10. Decisions Needed from RWA Committee

| # | Decision | Blocks | Needed by | Status |
|---|---|---|---|---|
| 1 | Approve phased rollout plan (Tower A → B → C) | Resident onboarding | Q3 2026 | **Pending** |
| 2 | Provide society UPI ID for dues QR | IMP-403 | Q2 2027 | **Pending** |
| 3 | Provide GSTIN for PDF receipts | IMP-402 | Q2 2027 | **BLOCKED** |
| 4 | Approve SMS budget for emergencies (~₹500/mo est.) | IMP-302 | Q1 2027 | **Pending** |
| 5 | Approve Razorpay / online payments | IMP-405 | H2 2027 | **DEFERRED** |
| 6 | Hub vs Dashboard — single home page preference | IMP-009 | Q3 2026 | **DONE** (Quick Home link added) |
| 7 | Nominate 5 community champions for beta | Launch | Q3 2026 | **Pending** |

---

## 11. Release & Communication Plan

| Milestone | Audience | Channel |
|---|---|---|
| Phase 0 complete | Admin + champions | Email + in-person walkthrough |
| Tower A rollout | Tower A residents | Notice + WhatsApp group + hub banner |
| Daily life features | All residents | Notice + demo at society event |
| AGM pack ready | Owners | Notice 2 weeks before AGM |
| Dues UPI live | All units | Notice with QR in portal |

---

## 12. Engineering Traceability

Every roadmap item maps to the implementation backlog:

| Roadmap phase | Backlog section | Item count | Status |
|---|---|---|---|
| Phase 0 — Stabilize | IMP-001–010 | 10 | **DONE** |
| Phase 1A — Daily life | IMP-101–116 | 16 | **DONE** |
| Phase 1B — Govern | IMP-201–211, IMP-301–306 | 14 | **DONE** |
| Phase 2 — Polish | IMP-401–417 | 13 | **10 DONE, 1 BLOCKED, 2 DEFERRED** |
| Staff & Contacts | STAFF-*, CONT-* | 113 | **68 DONE, 28 ON HOLD** |
| Global Search v2 | SRCH-* | 32 | **22 DONE, 10 REMAINING** |
| FAQ | FAQ-* | 45 | **41 DONE, 4 ON HOLD/DEFERRED** |
| Phase 3 — Evaluate | IMP-501–507 | 7 | **DEFERRED** |
| Documentation | IMP-D01–D05 | 5 | **DONE** |

**Detailed tracking:** [Dev backlog index](../dev/backlog.md)

**Functional specification:** [functional-spec.md](./functional-spec.md) · **Permissions:** [roles-and-permissions.md](./roles-and-permissions.md) · **Architecture:** [architecture.md](./architecture.md)

---

## 13. Document History

| Version | Date | Changes |
|---|---|---|
| 1.3 | 2026-07-07 | Spec docs reorganized; §2 deduplicated; FAQ traceability; KPI cross-link to functional-spec §14 |
| 1.2 | 2026-07-07 | Staff Registry v2 + contacts reviews shipped (§2.1); on-hold ideas catalog (§2.2) |
| 1.1 | 2026-07-05 | Updated status of completed features; Phase 0–1B and most of Phase 2 marked DONE |
| 1.0 | 2026-07-05 | Initial roadmap from PM review and v1 codebase assessment |

---

*This roadmap is reviewed quarterly with the RWA committee. Priorities may shift based on resident feedback and usage data.*
