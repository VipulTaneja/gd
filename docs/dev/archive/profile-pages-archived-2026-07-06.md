# Profile Pages — Archived Items

> **Source:** `backlog.md`
> **Archived:** 2026-07-06
> **Count:** 12 completed items

---

## Sprint 5 — Files & Notifications

| ID | Description | Complexity | Status |
|---|---|---|---|
| E14-S7 | Trigger notifications for: user approved, new poll created, new event, ticket status change, due reminder, notice published | M | DONE |

## Shared Components

| ID | Description | Complexity | Status |
|---|---|---|---|
| PROF-S1 | Build `<UserLink />` component — clickable name with optional avatar, hover tooltip (role + unit) | S | DONE |
| PROF-S2 | Build `<UnitLink />` component — tower-colored badge linking to unit profile page | S | DONE |
| PROF-S3 | Build `<MembershipTimeline />` component — vertical timeline of unit↔user relationships | M | DONE |

## User Profile Page

| ID | Description | Complexity | Status |
|---|---|---|---|
| PROF-S4 | User Profile — public view: header, unit & residency section, community memberships, RWA designation, activity summary | L | DONE |
| PROF-S5 | User Profile — self-edit mode: inline forms for name, phone, avatar upload, emergency contact, vehicle plates | M | DONE |
| PROF-S6 | User Profile — admin sections: change role dropdown, deactivate button, approval status, unit claim review, full membership history timeline | M | DONE |

## Unit Profile Page

| ID | Description | Complexity | Status |
|---|---|---|---|
| PROF-S7 | Unit Profile — resident view: header, current residents list, dues status summary, active visitor passes, open tickets, registered vehicles | L | DONE |
| PROF-S8 | Unit Profile — admin sections: assign resident button, transfer ownership button, generate due button, full membership history timeline | M | DONE |

## Retrofit Existing Pages

| ID | Description | Complexity | Status |
|---|---|---|---|
| PROF-S9 | Replace all plain-text user names with `<UserLink />` across admin tables, ticket comments, audit log, poll voters, RSVP lists, community member lists, notification items | M | DONE |
| PROF-S10 | Replace all plain-text unit numbers with `<UnitLink />` across directory, user profiles, ticket details, visitor pass details, dues tables, admin unit table, audit log | M | DONE |
| PROF-S11 | Add global search (Cmd+K command palette) — search users by name and units by number, navigate to profile | M | DONE |
