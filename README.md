# Gulshan Dynasty Community Portal

A resident-facing community management platform for **Gulshan Dynasty RWA** — 204 homes across 3 towers in Sector 144, Noida.

**This is not a sales website.** It's built for people who already live here.

---

## What It Does

| Feature | What Residents Get |
|---|---|
| **Community Hub** | Single-page home with shortcuts, live feed, and community stats |
| **Notices & Alerts** | Tower-filtered announcements, emergency broadcasts with acknowledgment |
| **Events & RSVP** | Community gatherings, AGM digital pack with quorum tracking |
| **Polls & Voting** | Society decisions, one-vote-per-unit enforcement for AGM compliance |
| **Visitor Passes** | Digital gate passes with OTP/QR, WhatsApp sharing, recurring daily help |
| **Amenity Booking** | Pool, theatre, cricket pitch, spa — slot grid with waitlist |
| **Helpdesk Tickets** | Report issues with photos, SLA tracking, satisfaction ratings |
| **Dues Ledger** | View maintenance bills, UPI QR payment, defaulter aging reports |
| **Discussion Forums** | Community conversations, scoped by tower or sub-community |
| **Sub-Communities** | Clubs and groups with their own polls, events, and file vaults |
| **Directory** | Find neighbors by tower — names only, privacy-safe |
| **File Vault** | Society documents — bylaws, AGM minutes, certificates |
| **Gate Validation** | Security staff PIN login, offline-capable PWA |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| React | 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI | shadcn v4 (Base UI primitives) |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 |
| Auth | NextAuth v5 (Google, Apple, email magic link) |
| File Storage | MinIO (S3-compatible, self-hosted) |
| Hosting | Vercel (Hobby) or Oracle Cloud Free Tier |
| Email | Resend (free tier) |

**Cost: $0/month** — fully self-hosted, no SaaS lock-in.

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 16
- MinIO (for file uploads)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your database URL, auth secrets, etc.

# 3. Run database migrations
npm run db:migrate

# 4. Generate Prisma client
npm run db:generate

# 5. Seed development data
npm run db:seed:dev

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Dev Quick Login

On `localhost`, the login page shows quick-login buttons for testing different roles without OAuth setup.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── page.tsx            # Community Hub (/)
│   ├── admin/              # Admin panel
│   ├── api/                # Route handlers
│   └── [feature]/          # Resident feature pages
├── components/
│   ├── hub/                # Community Hub widgets
│   ├── shell/              # ResidentShell, CasualHeader, MobileBottomNav
│   ├── shared/             # Reusable: PageHeader, SoftCard, UserLink, etc.
│   ├── ui/                 # shadcn primitives
│   └── [feature]/          # Feature-specific components
├── lib/                    # Server utilities: auth, db, rbac, hub-data
├── types/                  # Shared TypeScript types
└── generated/prisma/       # Generated — do not edit
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Seed scripts
docs/                       # Documentation
```

---

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed:dev` | Seed dev data |
| `npm run db:studio` | Prisma Studio (DB browser) |

---

## Documentation

| Doc | Location | Audience |
|---|---|---|
| **Specification index** | `docs/specification/README.md` | All — start here |
| **Functional Spec** | `docs/specification/functional-spec.md` | Product team, developers |
| **Roles & Permissions** | `docs/specification/roles-and-permissions.md` | Developers, support |
| **Design Profiles** | `docs/specification/design-profiles.md` | Frontend developers |
| **Product Roadmap** | `docs/specification/product-roadmap.md` | RWA committee, stakeholders |
| **Architecture** | `docs/specification/architecture.md` | Developers |
| **Dev Backlog** | `docs/dev/backlog.md` | Developers |
| **Deployment Guide** | `docs/deploy/vercel-neon-r2.md` | DevOps, deployers |

---

## Key Concepts

| Concept | Details |
|---|---|
| **Unit naming** | `{Tower}-{Floor}{Unit}` e.g. `C-0302` (regex: `^[ABC]-\d{4}$`) |
| **Towers** | A, B, C — 34 floors, 2 units/floor, 6 duplexes on top floors |
| **Time-bound RBAC** | Unit memberships have start/end dates; access expires automatically |
| **Three role layers** | Global (admin/resident), Unit (owner/tenant/family), Community (admin/member) |
| **Privacy** | Directory shows names only — no phone or email |

---

## Deployment

See [docs/deploy/vercel-neon-r2.md](docs/deploy/vercel-neon-r2.md) for free-tier deployment (Vercel + Neon + Cloudflare R2).

For self-hosted deployment on Oracle Cloud Free Tier, see the [Architecture doc](docs/specification/architecture.md).

---

## License

Private — Gulshan Dynasty RWA.
