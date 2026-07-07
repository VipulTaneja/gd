# Delegated Leadership — Active Backlog

> **Goal:** Deferred items and cancelled items for delegated leadership.
>
> **v1 core:** Shipped 2026-07-07 — 77 items archived.
> **Follow-on:** 18 items shipped 2026-07-07 — archived.
>
> **Related:** [`functional-spec.md`](../specification/functional-spec.md) §3.3 · [`architecture.md`](./architecture.md) · permissions matrix below

---

## Progress Summary

| Metric | Count |
|---|---|
| Active items | 0 |
| Deferred | 2 |
| Cancelled | 1 |
| Archived (v1) | 77 |
| Archived (follow-on) | 18 |
| **Total archived** | **95** |

---

## Deferred — Phase 6 Onboarding

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
| ONB-001 | Unblocks UL-031 |

---

*Last updated: 2026-07-07 · 95 archived (77 v1 + 18 follow-on) · 2 deferred · 1 cancelled*
