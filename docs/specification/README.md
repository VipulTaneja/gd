# Gulshan Dynasty Portal — Specification

Product and technical documentation for the **resident community portal** (204 homes, Sector 144, Noida). These documents describe **what** the system does, **who** can use it, **how** it is built, and **what** ships next.

> This is **not** the sales/marketing site (`gulshandynasty.com`). Audience: RWA committee, product team, developers, QA.

---

## Read in this order

| # | Document | Audience | Purpose |
|---|---|---|---|
| 1 | [Product Roadmap](./product-roadmap.md) | RWA, stakeholders | Vision, quarterly delivery, committee decisions |
| 2 | [Functional Spec](./functional-spec.md) | Product, QA, dev | Modules, business rules, user journeys, implementation status |
| 3 | [Roles & Permissions](./roles-and-permissions.md) | Dev, support, RWA | Access control matrix — start here for 403 errors |
| 4 | [Design Profiles](./design-profiles.md) | Frontend dev | UserLink, UnitLink, StaffLink, profile page layouts |
| 5 | [Architecture](./architecture.md) | Backend / full-stack dev | Stack, schema, routes, deployment, cron |

---

## Document map

```
specification/
├── README.md                 ← you are here
├── product-roadmap.md        WHEN — stakeholder roadmap & KPIs
├── functional-spec.md        WHAT — features, rules, status (authoritative)
├── roles-and-permissions.md  WHO — RBAC matrices
├── design-profiles.md        HOW (UI) — linking & profile conventions
└── architecture.md           HOW (tech) — stack, data model, ops
```

**Development tracking** (backlogs, sprints, archives) lives in [`../dev/`](../dev/) — not in this folder.

---

## Quick links by task

| I need to… | Read |
|---|---|
| Understand a feature module | [Functional Spec §5](./functional-spec.md#5-module-specifications) |
| Check if something is shipped | [Functional Spec §13](./functional-spec.md#13-implementation-status--known-gaps) |
| Debug permissions | [Roles & Permissions](./roles-and-permissions.md) |
| Add a clickable name or unit | [Design Profiles §1](./design-profiles.md#1-global-linking-convention) |
| Change schema or add API route | [Architecture §2–§4](./architecture.md#2-database-schema) |
| Plan next quarter | [Product Roadmap §5](./product-roadmap.md#5-quarterly-roadmap) |
| Pick up dev work | [Dev backlog index](../dev/backlog.md) |

---

## Relationship between docs

| Topic | Authoritative doc | Others link here |
|---|---|---|
| Feature behavior & business rules | `functional-spec.md` | Roadmap, roles |
| Permission / RBAC | `roles-and-permissions.md` | Functional spec §3 (personas only), architecture |
| UI linking & profiles | `design-profiles.md` | AGENTS.md (coding patterns) |
| Tech stack & infrastructure | `architecture.md` | AGENTS.md, deploy docs |
| Shipped vs planned (stakeholder) | `product-roadmap.md` | Functional spec §13 (detailed status) |
| Sprint / feature backlogs | `../dev/backlog*.md` | Roadmap §12 traceability |

**Avoid duplication:** Personas live in the functional spec; permission tables live in roles-and-permissions; UI shell patterns live in design-profiles + AGENTS.md.

---

*Last updated: 2026-07-07*
