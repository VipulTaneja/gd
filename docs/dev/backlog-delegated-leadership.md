# Delegated Leadership — Active Backlog

> **Goal:** Follow-on polish, v1.1 features, and deferred items for delegated leadership.
>
> **v1 core:** Shipped 2026-07-07 — see [`archive/delegated-leadership-archived-2026-07-07.md`](./archive/delegated-leadership-archived-2026-07-07.md) (77 items).
>
> **Related:** [`functional-spec.md`](../specification/functional-spec.md) §3.3 · [`architecture.md`](./architecture.md) · permissions matrix below

---

## Progress Summary

| Metric | Count |
|---|---|
| Active items | 3 |
| Backlog | 0 |
| Deferred | 2 |
| Cancelled | 1 |
| Archived (v1) | 77 |
| Done (follow-on) | 18 |

---

## Remaining Items

### P2 — Performance & polish

| ID | Description | P | Cplx | Deps | Status |
|---|---|---|---|---|---|
| LEAD-009 | Cache leader scope in JWT session | P2 | M | LEAD-006 | DONE |
| LEAD-020 | Leader hub (`/leader` or More menu) | P2 | M | UL-012, CL-013, AL-012 | DONE |
| LEAD-021 | Admin audit filters by leader actions | P2 | M | LEAD-001 | DONE |
| LEAD-024 | Global search + community notices (SRCH-010) | P2 | M | CL-030 | DONE |
| LEAD-025 | Leader dashboards mobile checklist | P1 | S | UL-019, CL-013 | DONE |
| UL-017 | Notify on invite + on accept/decline (extended) | P2 | M | UL-043, UL-014 | DONE |
| UL-028 | E3-S12 owner consent before tenant invite acceptance (`hold-backlog.md`) | P2 | M | UL-014 | DONE |
| UL-029b | Auto-process invite when account later approved | P2 | M | UL-029 | DONE |
| UL-034 | Multi-unit invite warning in UI | P1 | S | UL-014 | DONE |
| UL-042 | Rate-limit invite/search endpoints | P2 | S | UL-014 | DONE |
| UL-048 | Optional admin invite via `UnitMembershipRequest` for audit parity | P2 | M | UL-014 | DONE |
| AL-019 | `requiresApproval: true` when leaders assigned | P2 | XS | AL-011 | DONE |

### v1.1 — Follow-on

| ID | Description | P | Cplx | Deps | Status |
|---|---|---|---|---|---|
| CL-019 | Notify leaders on join request | P1 | S | CL-014 | DONE |
| CL-023 | Leader create scoped poll | P1 | M | CL-025 | DONE |
| AL-018 | Reject requires reason (visible to requester) | P1 | S | AL-013, LEAD-008 | DONE |

### Phase 5 — Event ↔ facility

| ID | Description | P | Cplx | Deps | Status |
|---|---|---|---|---|---|
| LEAD-005 | `Event.facilityId` FK | P2 | M | LEAD-003 | DONE |
| AL-016b | Event + facility linked booking | P2 | L | LEAD-005 | DONE |
| AL-017 | Unified amenity leader queue | P2 | L | AL-016b | DONE |

### Phase 6 — Onboarding (deferred)

| ID | Description | P | Cplx | Deps | Status |
|---|---|---|---|---|---|
| ONB-001 | Onboarding role picker; enables leader claim routing | P2 | L | LEAD-007 | DEFERRED |
| UL-031 | Leader claim approval + `approvalStatus` for claimants | P2 | M | ONB-001 | DEFERRED |

---

## Cancelled

| ID | Reason |
|---|---|
| UL-015 | Leader remove/end membership — admin-only |

---

## Permissions Reference (shipped v1)

See archived backlog for full matrix. Summary:

- **Super Admin** assigns all leader types; creates/archives communities
- **Unit leader** invites (`TENANT`, family roles); invitee accepts; no claim approval (v1)
- **Community leader** join approve (non-tower), scoped content, remove `MEMBER`
- **Amenity leader** approves bookings; RWA Admin always can override
- **BR-04** family cannot book facilities

---

## v1.1 Acceptance (remaining)

19. Onboarding role picker + leader claim routing (ONB-001, UL-031)

---

## Dependencies

| Item | Notes |
|---|---|
| [`hold-backlog.md` E3-S12](hold-backlog.md) | UL-028 tenant owner consent — **DONE** |
| [`backlog-global-search.md`](backlog-global-search.md) | LEAD-024 — **DONE** |
| ONB-001 | Unblocks UL-031 |

---

*Last updated: 2026-07-07 · 18 follow-on DONE · 2 deferred · 77 archived*
