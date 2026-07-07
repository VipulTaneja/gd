# Technical Architecture

> **For developers working on the Gulshan Dynasty Community Portal.**
>
> **Related docs:** [Specification index](./README.md) · [Functional Spec](./functional-spec.md) · [Roles & Permissions](./roles-and-permissions.md) · [Design Profiles](./design-profiles.md) · [Dev backlogs](../dev/backlog.md)

---

## 1. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | SSR/SSG for public page, RSC for portal |
| React | 19 | Latest stable |
| Language | TypeScript (strict) | Type safety across stack |
| Styling | Tailwind CSS v4 + `tw-animate-css` | Utility-first, animation support |
| UI primitives | shadcn v4 (`@base-ui/react`) | Copy-paste, fully customizable, no vendor lock-in |
| Icons | `lucide-react` | 1000+ icons, tree-shakeable, MIT |
| ORM | Prisma 7 + `@prisma/adapter-pg` | Type-safe schema, migrations, seeding |
| Database | PostgreSQL 16 | Full control, no row/storage limits |
| Auth | NextAuth v5 (Auth.js) | Google/Apple social login, email magic link, Prisma adapter |
| File storage | MinIO (self-hosted, S3-compatible) | Unlimited storage, S3 API compatible, $0 |
| Hosting | Vercel (Hobby) or Oracle Cloud Free Tier | $0/month |
| Email | Resend (free tier) | 3,000 emails/mo; magic links + notifications |
| DNS + CDN | Cloudflare (free plan) | DNS, caching, DDoS protection |

### Key Libraries

| Feature | Library | Notes |
|---|---|---|
| Data tables | TanStack Table + shadcn DataTable | Sort, filter, paginate |
| Forms | React Hook Form + Zod | Validation + state management |
| Rich text (forums) | @tiptap/react + starter kit | Bold, lists, links |
| QR codes | qrcode.react | Visitor pass QR |
| Charts | Recharts | Poll results, dues summaries |
| Date pickers | react-day-picker (via shadcn) | Calendar inputs |
| File upload | react-dropzone + MinIO SDK | Drag-drop, progress |
| Calendar view | FullCalendar (MIT) | Month/week/day views (Phase 2) |
| Email templates | React Email | Consistent branding |

---

## 2. Database Schema

> **Authoritative source:** `prisma/schema.prisma` — always run `npm run db:generate` after changes.
>
> This section documents design decisions. The actual schema includes all applied migrations.

### Core Entities

```
┌──────────┐       ┌──────────────────┐       ┌──────────┐
│   User   │──1:N──│  UnitMembership  │──N:1──│   Unit   │
└──────────┘       └──────────────────┘       └──────────┘
     │                    │ (role, start, end)
     │              ┌─────┘
     │              ▼
     │         ┌─────────┐
     │         │  Role   │ (OWNER, JOINT_OWNER, TENANT, OWNER_FAMILY, TENANT_FAMILY)
     │         └─────────┘
     │
     ├──1:N──┌────────────────────┐       ┌───────────────┐
     │       │ CommunityMembership│──N:1──│ SubCommunity  │
     │       └────────────────────┘       └───────────────┘
     │
     ├──1:N──┌──────────┐       ┌─────────┐
     │       │  Vote    │──N:1──│  Poll   │
     │       └──────────┘       └─────────┘
     │
     ├──1:N──┌──────────┐       ┌─────────┐
     │       │  RSVP    │──N:1──│  Event  │
     │       └──────────┘       └─────────┘
     │
     ├──1:N──┌───────────────┐
     │       │ VisitorPass   │
     │       └───────────────┘
     │
     └──1:N──┌───────────────┐
             │ HelpTicket    │
             └───────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| `UnitMembership` with `startDate`/`endDate` | Historical tracking + automatic expiry via cron. `endDate = null` means currently active. |
| `@@unique([userId, unitId, role, startDate])` | Prevents duplicates but allows role changes over time. |
| Separate `GlobalRole` vs `UnitRole` vs `CommunityRole` | Clean separation: system admin powers vs unit residency vs sub-community participation. |
| `Poll.scope` + nullable `subCommunityId` | One table handles both global and scoped polls. |
| `AuditLog` with generic `entityType`/`entityId` | Polymorphic pattern; one log table for all entity types. |
| `Facility.capacity` | Supports shared facilities (pool=20) and exclusive ones (theatre=1). |
| `Poll.eligibility` + `isResolution` | AGM compliance: one-vote-per-unit, quorum tracking. |
| `FaqSection` + `FaqItem` with publish flags | Public FAQ tree; section and item must both be published; cascade delete on section. |
| `Designation.title` as `DesignationTitle` enum | Committee roles constrained for RBAC (FAQ edit access, display labels). |

### Role System

Three independent role layers:

| Layer | Values | Scope |
|---|---|---|
| `GlobalRole` | SUPER_ADMIN, ADMIN, RESIDENT, NON_RESIDENT, SECURITY_STAFF | System-wide |
| `UnitRole` | OWNER, JOINT_OWNER, TENANT, OWNER_FAMILY, TENANT_FAMILY | Per unit, time-bound |
| `CommunityRole` | ADMIN, MEMBER | Per sub-community |

### Timezone Convention

All `DateTime` fields stored as UTC in PostgreSQL. Displayed in `Asia/Kolkata` (IST, UTC+5:30) on frontend.

---

## 3. Authorization

Permission rules are documented in **[Roles & Permissions](./roles-and-permissions.md)** — the authoritative access matrix.

| Concern | Code location |
|---|---|
| Global admin | `src/lib/rbac.ts` → `isAdmin()` |
| Unit membership | `src/lib/rbac.ts` → `hasActiveUnitRole()`, `getUserUnitMemberships()` |
| Delegated leadership | `src/lib/rbac-leaders.ts` |
| Staff / FAQ / forums | `src/lib/staff-auth.ts`, `src/lib/faq-auth.ts`, `src/lib/forums/rbac.ts` |
| Route protection | `src/middleware.ts` (JWT only — no Prisma) |

**Key rules (summary):** Family members can read and raise tickets but not vote or book facilities. Security staff validate passes only. Committee designation holders can edit FAQ at `/faq/manage` without admin role.

---

## 4. Route Map

```
/ ........................... Community Hub (public, SSG)
/login ...................... Auth (Google/Apple/Magic Link/dev credentials)
/onboarding/terms ........... Terms acceptance (post-first-login)
/onboarding/unit-claim ...... Unit claim (post-first-login)
/pending .................... "Awaiting approval" holding page

/dashboard .................. Resident home (redirects to /)
/directory .................. Unit directory with tower filter
/profile .................... Edit profile, vehicles, emergency contact
/notifications .............. In-app notification list

/communities ................ Sub-community directory
/communities/[id] ........... Sub-community detail

/polls ...................... Global polls
/polls/[id] ................. Poll detail + vote
/events .................... Global events
/events/[id] ................ Event detail + RSVP

/visitors ................... My visitor passes (+ Regular Help tab)
/visitors/[id] .............. Pass detail + QR + WhatsApp share

/staff ...................... Regular Help directory
/staff/[id] ................. Staff profile + reviews

/contacts ................... Important contacts (vendors)
/contacts/[id] .............. Contact detail + reviews

/faq ........................ Public FAQ (guests)
/faq/app .................... Resident FAQ (DashboardLayout)
/faq/manage ................. FAQ editor (committee + admin)

/tickets .................... My help tickets
/tickets/new ................ Raise a ticket
/tickets/[id] ............... Ticket detail + comments

/facilities ................. Bookable amenities
/facilities/[id] ............ Availability grid + book

/dues ....................... My unit's dues
/files ...................... Global society documents
/committee .................. RWA committee page
/forums ..................... Discussion forums
/forums/[slug] .............. Forum category
/forums/[slug]/[threadId] ... Thread detail

/admin ...................... Admin dashboard
/admin/users ................ User management
/admin/units ................ Unit management
/admin/communities .......... Sub-community management
/admin/notices .............. Notice CRUD
/admin/dues ................. Due generation + reports
/admin/tickets .............. All tickets + assignment
/admin/audit ................ Audit log
/admin/export ............... Data export (CSV)

/gate ....................... Security guard validation (standalone PWA)
```

---

## 5. Non-Functional Requirements

Targets below match [Functional Spec §13.3](./functional-spec.md#133-non-functional-requirements-target).

| Category | Target |
|---|---|
| Performance | < 2s page load; Lighthouse ≥ 90 |
| Mobile | Responsive; mobile-first for resident features |
| Security | HTTPS, CSRF (server actions), rate limiting on API |
| Rate limiting | 100 req/min authenticated, 20 req/min unauthenticated |
| Availability | 99.5% uptime target |
| Backup | Daily DB backup, 30-day retention |
| Timezone | IST display, UTC storage |
| Accessibility | WCAG 2.1 AA |

### Rate Limiting

Middleware-level rate limiting with in-memory Map (TTL-based). Sufficient for 204-unit community.

### Session Duration

| Role | Session maxAge |
|---|---|
| Residents | 30 days |
| SECURITY_STAFF | 30 days (shared gate device) |
| Admins | 7 days |

---

## 6. Environment Variables

```bash
# Core
NEXT_PUBLIC_APP_URL=https://portal.gulshandynasty.com
NEXTAUTH_SECRET=<random-32-char>
NEXTAUTH_URL=https://portal.gulshandynasty.com

# Auth providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/gulshan_dynasty

# File storage (MinIO local or Cloudflare R2)
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=community-files

# Email
RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.com

# Bootstrap
SETUP_SECRET=<one-time-setup-key>

# Cron (Vercel)
CRON_SECRET=<random-string>

# Optional: Cloudflare R2 for off-site backups
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
```

---

## 7. Cron Jobs

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/close-polls` | Every hour | Auto-close polls past `closesAt` |
| `/api/cron/due-reminders` | Daily 06:00 UTC | Email residents with upcoming dues |
| `/api/cron/expire-memberships` | Daily 02:00 UTC | Deactivate expired UnitMemberships |
| `/api/cron/expire-passes` | Every 15 minutes | Mark expired visitor passes |
| `/api/cron/generate-staff-passes` | Daily 06:00 IST | Generate `DAILY_HELP` passes for staff |

---

## 8. Deployment

See [deploy/vercel-neon-r2.md](../deploy/vercel-neon-r2.md) for Vercel + Neon + Cloudflare R2 free-tier deployment.

### Self-Hosted Alternative (Oracle Cloud Free Tier)

```
┌─────────────────────────────────────────────────────────┐
│  Oracle Cloud ARM VM (4 OCPU, 24GB RAM)                 │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌───────────┐ │
│  │  Caddy   │  │ Next.js  │  │Postgres│  │   MinIO   │ │
│  │(reverse  │  │  (app)   │  │  16    │  │(S3-compat │ │
│  │proxy+SSL)│  │          │  │        │  │  storage) │ │
│  └─────────┘  └──────────┘  └────────┘  └───────────┘ │
│                                                          │
│  Managed by: Coolify (open-source PaaS)                 │
└─────────────────────────────────────────────────────────┘
```

| Service | Cost |
|---|---|
| Oracle Cloud ARM VM | $0 (forever free) |
| Coolify (PaaS) | $0 (MIT) |
| Caddy (reverse proxy) | $0 (Apache 2.0) |
| PostgreSQL 16 | $0 |
| MinIO | $0 (AGPL) |
| Cloudflare (DNS + CDN) | $0 |
| Resend (email) | $0 (3K/mo free) |

---

## 9. UI Architecture

Resident vs admin shells, microcopy, and profile linking are specified in:

| Topic | Document |
|---|---|
| Profile linking (`UserLink`, `UnitLink`, `StaffLink`, `ContactLink`) | [Design Profiles](./design-profiles.md) |
| Resident shell, microcopy, mobile patterns | [AGENTS.md](../../AGENTS.md) |
| Feature color keys | `src/lib/feature-colors.ts` |
| Shared components (`PageHeader`, `SoftCard`, etc.) | `src/components/shared/` |

**Resident shell:** `CasualHeader` + `MobileBottomNav` via `DashboardLayout` / `ResidentShell`.  
**Admin shell:** Dark sidebar at `/admin/*` — intentionally utilitarian.

---

## 10. Content Strategy

> This is a **resident community portal**, not a sales website. The official gulshandynasty.com handles marketing.

| Sales Site (gulshandynasty.com) | Our Resident Portal |
|---|---|
| "Horizon Embracing Opulence" | "Welcome Home" / "Your Community Hub" |
| Marketing hyperbole | Warm, concise, functional |
| Prospective buyer audience | Current resident audience |
| Selling amenities as aspirational | Showing amenities as bookable services |

**Reuse from sales site:** Logo, favicon, gallery images, property stats.
**Do NOT reuse:** Sales copy, pricing, RERA disclaimers, "Book a site visit" CTAs.

---

*Last updated: 2026-07-07*
