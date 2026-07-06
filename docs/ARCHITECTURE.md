# Gulshan Dynasty Community Portal — Technical Architecture & Product Backlog

---

## 0. Property Context & Content

### Property Identity

| Attribute | Value |
|---|---|
| **Name** | Gulshan Dynasty |
| **Tagline** | "Horizon Embracing Opulence" |
| **Subtitle** | "A dream. A destination. A dynasty." |
| **Description** | "A complete neighbourhood to compliment your lifestyle" |
| **Location** | Sector 144, Noida Expressway, Uttar Pradesh (GH-03D, Sector 144, Noida 201306) |
| **Developer** | Gulshan Group (Corporate: 7th Floor, Plot No. C3-E1, Gulshan One29, Sector 129, Noida 201304) |
| **Scale** | 5.8 Acres, low-density living |
| **Towers** | 3 |
| **Floors** | 34 per tower |
| **Apartments** | 198 |
| **Duplexes** | 6 |
| **Total Units** | 204 (198 apartments + 6 duplexes) |
| **Unit Type** | 4 BHK Ultra-Luxury Apartments (approx. 2783+ sq. ft.) |
| **Certifications** | NCR's First IGBC Platinum-rated Green Homes |
| **RERA** | UPRERAPRJ950870 |
| **Status** | Project completion certificate received; delivered before time |
| **Contact** | Luxury@gulshangroup.com / 8010444888 |
| **Location Advantages** | University, Metro, Shopping, Hospital — all in proximity |

### Key Amenities (Featured in "Book Amenities" Module)

- Hydroponic Farm-to-Fork Experience
- Resort-style Swimming Pool & Sun Deck
- Rooftop Recreation Center & Sky Deck
- State-of-the-Art Spa & Wellness Center
- Mini Theatre & Amphitheater
- Cricket Pitch & Skating Rink
- Contactless Homes (Separate service entries)

### UI/UX & Design Guidelines

**Design Language:** Art Deco visual arts — luxurious, elegant, with clean lines, dark/gold accents, and ample whitespace.

**Color Palette (derived):**
- Primary: Deep charcoal / black (`#1a1a1a`)
- Accent: Gold (`#c9a84c` / `#d4af37`)
- Surface: Warm off-white (`#faf8f5`)
- Text: Rich black on light, warm cream on dark

**Typography:** Serif for headings (Art Deco feel), clean sans-serif for body.

### Image Assets

#### Official Site Assets (from gulshandynasty.com)

| ID | URL | Context |
|---|---|---|
| logo | `https://www.gulshandynasty.com/images/logo.webp` | Header logo |
| banner-1 | `https://www.gulshandynasty.com/images/banner-1.webp` | Hero carousel slide 1 |
| banner-2 | `https://www.gulshandynasty.com/images/banner-2.webp` | Hero carousel slide 2 |
| banner-3 | `https://www.gulshandynasty.com/images/banner-3.webp` | Hero carousel slide 3 |
| overview | `https://www.gulshandynasty.com/images/overview.webp` | Property overview / aerial |
| project | `https://www.gulshandynasty.com/images/project.webp` | Project exterior |
| gallery-1 | `https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-1.webp` | Gallery: luxury interiors |
| gallery-2 | `https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-2.webp` | Gallery: premium apartments |
| gallery-3 | `https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-3.webp` | Gallery: exclusive flats |
| gallery-4 | `https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-4.webp` | Gallery: premium project |
| gallery-5 | `https://www.gulshandynasty.com/images/gulshan-dynasty-gallery-5.webp` | Gallery: housing complex |
| key-image | `https://www.gulshandynasty.com/images/key-image.webp` | Key features hero |
| key-1 | `https://www.gulshandynasty.com/images/key-1.webp` | Feature highlight 1 |
| key-2 | `https://www.gulshandynasty.com/images/key-2.webp` | Feature highlight 2 |
| key-3 | `https://www.gulshandynasty.com/images/key-3.webp` | Feature highlight 3 |
| key-4 | `https://www.gulshandynasty.com/images/key-4.webp` | Feature highlight 4 |
| favicon | `https://www.gulshandynasty.com/images/favicon.png` | Browser favicon |

#### Supplementary Assets (for sections needing additional imagery)

| Context | URL |
|---|---|
| Luxury Interiors / Smart Home | `https://media.designcafe.com/wp-content/uploads/2025/04/17185319/luxury-apartment-interior-design-ideas.jpg` |
| Club House & Pool | `https://meenakshigroup.com/elan/wp-content/uploads/2023/06/club-house-img-01.jpg` |
| Green Architecture (Platinum-rated) | `https://vistafolia.com/wp-content/uploads/2024/11/Ten30-Shoma-40-HDR-2048x1366-1.jpg.webp` |

### Unit Structure

| Attribute | Value |
|---|---|
| **Towers** | 3 — Tower A, Tower B, Tower C |
| **Floors per tower** | 34 |
| **Units per floor** | 2 |
| **Apartments** | 198 (standard 4 BHK units across most floors) |
| **Duplexes** | 6 (likely top floors — 2 per tower on floors 33–34) |
| **Total units** | 3 × 34 × 2 = **204** (198 + 6) |
| **Naming convention** | `{Tower}-{Floor:2}{Unit:2}` e.g. `C-0302` = Tower C, Floor 3, Unit 02 |

**Examples:**
- `A-0101` — Tower A, Floor 1, Unit 01
- `A-0102` — Tower A, Floor 1, Unit 02
- `B-1701` — Tower B, Floor 17, Unit 01
- `C-3402` — Tower C, Floor 34, Unit 02 (duplex)

### Data Model Implications

- `Unit.unitType`: `APARTMENT` (198 units) or `DUPLEX` (6 units on top floors)
- `Unit.areaSqFt`: defaults to `2783` for apartments; duplexes may be larger
- `Unit.block` values: `"A"`, `"B"`, `"C"`
- `Unit.floor` range: 1–34
- `Unit.unitNumber` format: regex `^[ABC]-\d{4}$` (validated on creation)
- `UnitType` enum needs `DUPLEX` added
- Facility seed data: Pool & Sun Deck, Rooftop Recreation, Spa & Wellness, Mini Theatre, Amphitheater, Cricket Pitch, Skating Rink
- Seed script auto-generates all 204 units using the naming convention
- Total units = 204 (progress tracking: "176/204 units onboarded")

### Content Strategy — Resident Portal (NOT a Sales Site)

> **Important:** The official gulshandynasty.com is a **sales/marketing** site for prospective buyers.
> Our portal is a **resident-facing community management platform** for people who already live here.
> The tone, content, and purpose are fundamentally different.

**Our portal's purpose:**
- Welcome existing residents home (not sell them a flat)
- Provide quick access to community services (bookings, passes, tickets, notices)
- Foster a sense of belonging and community pride

**Tone differences:**

| Sales Site (gulshandynasty.com) | Our Resident Portal |
|---|---|
| "Horizon Embracing Opulence" | "Welcome Home" / "Your Community Hub" |
| Marketing hyperbole | Warm, concise, functional |
| Prospective buyer audience | Current resident audience |
| Selling amenities as aspirational | Showing amenities as bookable services |
| No login required | Login-gated for residents |

**What we reuse from the sales site:**
- Logo (`logo.webp`) — brand consistency
- Favicon (`favicon.png`)
- Gallery images — for visual warmth on the landing page (residents still appreciate seeing their community beautifully)
- Property stats (5.8 acres, 3 towers, 204 units) — for the "About Our Community" section
- Location map data — for the visitor/directions section

**What we do NOT reuse:**
- Sales copy ("panoramic views of natural extravagance...")
- "Book a site visit" CTAs
- Pricing information
- RERA/legal disclaimers (not relevant to residents)
- "Contact us for enquiry" framing (residents already live there)

**Resident Portal Landing Page Copy (Rewritten):**

| Section | Headline | Body |
|---|---|---|
| Hero | **Welcome to Gulshan Dynasty** | "Your community. Your people. Your portal." |
| About | **Our Community** | "204 homes across 3 towers, set in 5.8 acres of green living in Sector 144, Noida. NCR's first IGBC Platinum-rated community." |
| Quick Access | **What would you like to do?** | Card grid: Book Amenity, Raise Ticket, Create Visitor Pass, View Notices |
| Amenities | **Community Amenities** | "Book your favourite spaces — pool, theatre, cricket pitch, and more." |
| Community | **Clubs & Groups** | "Join your neighbours in shared interests — from sports to gardening." |
| CTA | **Resident Login** | "Sign in to access your community dashboard, manage visitors, and stay updated." |
| Footer | Gulshan Dynasty Residents' Association | Address, RWA contact (not sales), social links |

**Navigation for Resident Portal:**
- Home (landing)
- Amenities (book facilities)
- Community (sub-communities directory)
- Notices
- Login / My Dashboard

**Footer Content:**
- Gulshan Dynasty Residents' Welfare Association
- Site address: GH-03D, Sector 144, Noida, UP 201306
- RWA email (to be configured, not Luxury@gulshangroup.com)
- Portal version
- Privacy Policy | Terms of Use

---

## 1. Clarifying Questions & Assumptions

| # | Question / Edge Case | Assumed Answer (for progress) |
|---|---|---|
| 1 | Can a single user be an Owner of Unit A **and** a Tenant of Unit B simultaneously? | **Yes** — the user↔unit↔role join table supports multiple concurrent relationships per user. |
| 2 | When a time-bound role expires, should the user retain read-only access to historical data (past polls, documents) or be fully locked out? | **Locked out** of unit-scoped data; personal profile remains accessible. |
| 3 | Should "Joint Owner" have identical permissions to "Owner", or is there a primary vs. secondary distinction? | **Identical permissions** — any joint owner can act on behalf of the unit. |
| 4 | For the Visitor Management System, is there an intercom/hardware integration, or is it purely digital (OTP + QR code shown at gate)? | **Purely digital** — OTP/QR validated by security guard's app/tablet. |
| 5 | Does the Dues & Payments module need an actual payment gateway (Razorpay/Stripe) or just a ledger that admins update manually? | **Ledger first** (MVP); payment gateway integration as a Phase-2 enhancement. |
| 6 | Are sub-community discussions needed (threaded comments/chat), or are Polls + Events + Files sufficient for v1? | **No real-time chat for v1**; a simple announcements/notice board per sub-community suffices. |
| 7 | File Vault — any size/type restrictions? Virus scanning? | **Max 25 MB per file**, common doc types (PDF, DOCX, XLSX, images). No virus scanning in v1. |
| 8 | Multi-tenant SaaS (serving multiple societies) or single-tenant deployment for Gulshan Dynasty only? | **Single-tenant** — deployed for this one society. Multi-tenant can be a future enhancement. |
| 9 | Notification channels: in-app only, or also email/SMS/push? | **In-app + email** for v1; SMS/push as Phase-2. |
| 10 | Should the system track an audit log of admin actions (approve user, change role, delete file)? | **Yes** — important for transparency in a society context. |

---

## 2. Proposed Tech Stack (Free & Open-Source First)

### 2.1 Core Stack

| Layer | Choice | License / Cost | Rationale |
|---|---|---|---|
| Frontend | **Next.js 15 (App Router)** + Tailwind CSS | MIT / $0 | SSR/SSG for public page, RSC for portal |
| UI Components | **shadcn/ui** (Radix primitives) | MIT / $0 | Copy-paste components, fully customizable, no vendor lock-in |
| Backend/API | **Next.js Route Handlers** | MIT / $0 | Co-located with frontend, zero extra infra |
| Database | **PostgreSQL 16** (self-hosted in Docker) | PostgreSQL License / $0 | Full control, no row/storage limits, no cold starts |
| ORM | **Prisma** | Apache 2.0 / $0 | Type-safe schema, migrations, seeding |
| Auth | **NextAuth.js v5 (Auth.js)** | ISC / $0 | Google/Apple social login, Prisma adapter built-in |
| File Storage | **MinIO** (self-hosted, S3-compatible) | AGPL / $0 | Unlimited storage (limited only by disk), S3 API compatible |
| Hosting | **Oracle Cloud Free Tier** (ARM VM) | Forever free / $0 | 4 OCPU, 24GB RAM, 200GB disk — no credit card charges ever |
| PaaS/Deploy | **Coolify** (self-hosted) | Apache 2.0 / $0 | Git-push deploys, auto-SSL, monitoring, like Vercel but free |
| Reverse Proxy | **Caddy** | Apache 2.0 / $0 | Auto-HTTPS via Let's Encrypt, zero config |
| Email | **Resend** (external, free tier) | Free tier / $0 | 3,000 emails/mo; only external paid service if exceeded |
| DNS + CDN | **Cloudflare** (free plan) | Free / $0 | DNS, caching, DDoS protection, no bandwidth caps |
| Cron/Jobs | **System cron** or Coolify scheduler | $0 | Unlimited jobs at any frequency — no vendor cap |
| Notifications | Custom in-app (DB-backed) + email | $0 | Simple notification table; Novu only if multi-channel needed later |

### 2.2 Pre-Built Open-Source Libraries (Reuse over Build)

Rather than building complex UI/logic from scratch, we leverage these battle-tested free libraries:

| Feature Area | Library | What It Replaces |
|---|---|---|
| **Data Tables** | **TanStack Table** (headless) + shadcn DataTable | Custom table with sort/filter/pagination |
| **Forms & Validation** | **React Hook Form** + **Zod** | Custom form state management |
| **Calendar View** | **FullCalendar** (MIT) or **react-big-calendar** | Custom calendar grid from scratch |
| **Date/Time Pickers** | shadcn date-picker (wraps **react-day-picker**) | Custom date input |
| **Rich Text (Notices)** | **Tiptap** (open-source core) | Custom WYSIWYG editor |
| **Charts (Poll Results)** | **Recharts** or **Chart.js** via **react-chartjs-2** | Custom SVG charts |
| **File Upload UI** | **react-dropzone** + shadcn styling | Custom drag-and-drop |
| **QR Codes (VMS)** | **qrcode.react** | Custom QR generation |
| **Carousel (Landing)** | **Embla Carousel** (shadcn built-in) | Custom image slider |
| **Maps (Location)** | **Leaflet** + **react-leaflet** | Google Maps (paid at scale) |
| **PDF Generation** | **@react-pdf/renderer** or **jsPDF** | Server-side PDF (receipts, passes) |
| **Email Templates** | **React Email** | Raw HTML email templates |
| **Icons** | **Lucide React** (shadcn default) | Icon packs with licensing issues |
| **Toast/Alerts** | **Sonner** (shadcn integrated) | Custom notification toasts |
| **Modal/Dialog** | shadcn Dialog (wraps **Radix**) | Custom modal logic |
| **Command Palette** | shadcn Command (wraps **cmdk**) | Custom search/navigation |
| **Avatar/Initials** | shadcn Avatar (wraps **Radix**) | Custom user avatar component |
| **Skeleton Loaders** | shadcn Skeleton | Custom loading states |

### 2.3 Hosting Strategy — Minimize Cost to $0/month

#### Recommended: Self-Hosted on Oracle Cloud Free Tier (Forever Free)

Oracle Cloud offers **always-free** ARM instances that are more than sufficient for a ~200-unit / ~600-user community portal. This eliminates ALL recurring hosting costs.

**What you get for $0/month (forever, not a trial):**
- 2× ARM Ampere VMs (total: 4 OCPUs, 24 GB RAM)
- 200 GB block storage
- 10 TB/month outbound data transfer
- Load balancer (1 instance)

**Architecture on Oracle Cloud Free Tier:**

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

| Component | Role | Cost |
|---|---|---|
| **Coolify** (self-hosted) | PaaS — git push deploy, SSL, monitoring, cron | $0 (MIT license) |
| **Caddy** | Reverse proxy + auto-HTTPS (Let's Encrypt) | $0 (Apache 2.0) |
| **PostgreSQL 16** | Database (Docker container) | $0 |
| **MinIO** | S3-compatible object storage for files | $0 (AGPL, self-hosted OK) |
| **Node.js** | Next.js standalone server | $0 |

**Why this works for Gulshan Dynasty (204 units):**
- Peak concurrent users: ~30-50 (residents checking notices/polls)
- Registered users: ~600-800 max (owners, family, tenants, staff)
- Database size: <50MB for years (text data + metadata for 204 units)
- File storage: ~10-30GB (community documents, photos)
- 24GB RAM is wildly overkill — leaves headroom for years of growth

#### Alternative: Ultra-Cheap VPS (if Oracle is too complex)

| Provider | Spec | Cost/Month |
|---|---|---|
| **Hetzner CAX11** (ARM) | 2 vCPU, 4GB RAM, 40GB SSD | **€3.79** (~$4) |
| **Hetzner CX22** (x86) | 2 vCPU, 4GB RAM, 40GB SSD | **€3.99** (~$4.30) |
| **Netcup RS 1000** | 4 vCPU, 4GB RAM, 128GB SSD | **€4.50** (~$5) |
| **Contabo VPS S** | 4 vCPU, 8GB RAM, 200GB SSD | **€5.99** (~$6.50) |

All of these run the entire stack (app + DB + storage) on one machine.

#### External Services (Kept Free)

| Service | What For | Free Tier | Monthly Cost |
|---|---|---|---|
| **Resend** | Transactional email | 3,000 emails/mo | $0 |
| **Cloudflare** (free plan) | DNS + CDN + DDoS protection | Unlimited | $0 |
| **GitHub** | Source code + CI (Actions) | 2,000 min/mo | $0 |
| **Let's Encrypt** (via Caddy) | SSL certificates | Unlimited | $0 |
| **UptimeRobot** | Uptime monitoring | 50 monitors | $0 |

#### Total Cost Comparison

| Approach | Monthly Cost | Annual Cost |
|---|---|---|
| **Oracle Cloud Free** (recommended) | **$0** | **$0** |
| Hetzner VPS | $4 | $48 |
| Vercel Free + Supabase Free + Resend Free | $0 (but subject to usage caps & TOS) | $0 |
| Vercel Pro + Supabase Pro (if you outgrow free) | $45 | $540 |

#### Deployment Pipeline (Self-Hosted)

```
Developer pushes to GitHub main
        │
        ▼
GitHub webhook → Coolify
        │
        ▼
Coolify pulls, builds Docker image, deploys
        │
        ▼
Zero-downtime rolling restart via Caddy
```

- **No CI/CD cost** — Coolify handles builds on the server itself
- **Auto-SSL** — Caddy provisions Let's Encrypt certs automatically
- **Backups** — Daily pg_dump to the same VM (200GB storage) + optional weekly upload to Cloudflare R2 free tier (10GB)

#### Cron Jobs (Self-Hosted, No Vercel Pro Needed)

With self-hosting, cron is free and unlimited:

| Job | Schedule | Purpose |
|---|---|---|
| Role expiry check | Every hour | Deactivate expired UnitMemberships |
| Visitor pass expiry | Every 15 min | Mark expired passes |
| Due date reminders | Daily 9 AM | Email residents with upcoming dues |
| Database backup | Daily 2 AM | pg_dump → compressed archive |
| Notice cleanup | Weekly | Archive expired notices |

These run as system cron or via Coolify's built-in scheduler.

### 2.3.1 Previous Cost Analysis (SaaS Free Tiers — Fallback Option)

If self-hosting feels too complex, the SaaS free-tier approach still works:

| Service | Free Tier Allowance | Sufficient for 204-unit community? |
|---|---|---|
| Vercel (Hobby) | 100GB bandwidth, 1000 builds/mo | Yes (but TOS prohibits commercial use) |
| Supabase (Free) | 500MB DB, 1GB storage, 50K auth MAUs | Yes for 204-unit community |
| Neon (Free) | 512MB storage, 100 hours compute | Yes |
| Resend (Free) | 3,000 emails/month | Yes (~1,700/mo normal; spikes during AGM) |
| UploadThing (Free) | 2GB storage, 2GB transfer | Tight; Supabase Storage preferred |

⚠️ **Risk**: Free tiers can be revoked, rate-limited, or require upgrade at any time. Self-hosting gives full control.

### 2.4 Build vs. Reuse Decision Matrix

| Component | Decision | Justification |
|---|---|---|
| Auth flow | **Reuse** (Auth.js) | Handles OAuth, sessions, CSRF — months of work saved |
| Admin dashboard layout | **Reuse** (shadcn sidebar + breadcrumbs) | Pre-built responsive nav patterns |
| Data tables (users, units, tickets) | **Reuse** (TanStack Table) | Sorting, filtering, pagination out of the box |
| Calendar/events | **Reuse** (FullCalendar) | Event rendering, drag/drop, month/week/day views |
| Polling UI | **Build** (simple) | No good open-source poll widget; it's just radio buttons + a progress bar |
| RBAC middleware | **Build** | Custom time-bound logic is domain-specific |
| Visitor pass QR | **Reuse** (qrcode.react) | One-liner to generate QR from string |
| File upload | **Reuse** (react-dropzone + MinIO S3 SDK) | Handles drag-drop, progress, validation |
| Notification system | **Reuse** (Novu self-hosted or custom in-app) | Novu handles multi-channel; overkill if only in-app+email, then build simple |
| Ticket comments | **Build** (simple) | Just a list + textarea; not worth a library |
| Landing page | **Reuse** (shadcn blocks / Aceternity UI) | Pre-designed hero, feature grids, testimonial sections |
| Charts | **Reuse** (Recharts) | Bar/pie charts for poll results, dues summaries |

### 2.5 Notable Free Alternatives Considered

| Instead of... | We use... | Why |
|---|---|---|
| AWS S3 ($) | MinIO (self-hosted, S3-compatible) | Unlimited storage, no billing, same S3 API |
| SendGrid ($) | Resend (free tier) | Better DX with React Email, generous free tier |
| Google Maps ($) | Leaflet + OpenStreetMap (free) | No API key billing; community map doesn't need Street View |
| Paid icon sets | Lucide (MIT) | 1000+ icons, tree-shakeable, shadcn-native |
| Custom design system | shadcn/ui (free) | Production-quality, accessible, Radix-based |
| Paid notification SaaS | Novu (MIT, self-host) | Open-source notification infra with in-app + email |
| Paid form builders | React Hook Form + Zod (MIT) | Industry standard, zero bundle cost for validation |

---

## 3. Database Schema (Core Entities)

### 3.1 Entity-Relationship Diagram (Textual)

```
┌──────────┐       ┌──────────────────┐       ┌──────────┐
│   User   │──1:N──│  UnitMembership  │──N:1──│   Unit   │
└──────────┘       └──────────────────┘       └──────────┘
     │                    │ (role, start, end)
     │              ┌─────┘
     │              ▼
     │         ┌─────────┐
     │         │  Role   │ (enum: OWNER, JOINT_OWNER, TENANT, OWNER_FAMILY, TENANT_FAMILY)
     │         └─────────┘
     │
     ├──1:N──┌────────────────────┐       ┌───────────────┐
     │       │ CommunityMembership│──N:1──│ SubCommunity  │
     │       └────────────────────┘       └───────────────┘
     │
     ├──1:N──┌──────────┐
     │       │  RSVP    │──N:1──┌─────────┐
     │       └──────────┘       │  Event  │
     │                          └─────────┘
     │
     ├──1:N──┌──────────┐       ┌─────────┐
     │       │  Vote    │──N:1──│  Poll   │
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

### 3.2 Schema Definition (Prisma-style)

```prisma
// ─── AUTH & USERS ───────────────────────────────────────────────

enum GlobalRole {
  SUPER_ADMIN
  ADMIN
  RESIDENT
  NON_RESIDENT
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

model User {
  id             String          @id @default(cuid())
  name           String
  email          String          @unique
  phone          String?
  avatarUrl      String?
  globalRole     GlobalRole      @default(RESIDENT)
  approvalStatus ApprovalStatus  @default(PENDING)
  approvedBy     String?
  approvedAt     DateTime?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  accounts            Account[]
  sessions            Session[]
  unitMemberships     UnitMembership[]
  communityMemberships CommunityMembership[]
  votes               Vote[]
  rsvps               RSVP[]
  visitorPasses       VisitorPass[]
  helpTickets         HelpTicket[]
  auditLogs           AuditLog[]
}

// NextAuth models (Account, Session, VerificationToken) omitted for brevity

// ─── UNITS & TIME-BOUND RBAC ────────────────────────────────────

enum UnitType {
  APARTMENT
  DUPLEX
  VILLA
  SHOP
  OFFICE
}

model Unit {
  id          String     @id @default(cuid())
  unitNumber  String     @unique   // e.g. "A-1201"
  block       String                // e.g. "Tower A"
  floor       Int?
  unitType    UnitType   @default(APARTMENT)
  areaSqFt    Float?
  createdAt   DateTime   @default(now())

  memberships UnitMembership[]
  dues        Due[]
}

enum UnitRole {
  OWNER
  JOINT_OWNER
  TENANT
  OWNER_FAMILY
  TENANT_FAMILY
}

model UnitMembership {
  id        String    @id @default(cuid())
  userId    String
  unitId    String
  role      UnitRole
  startDate DateTime
  endDate   DateTime?  // null = currently active (no known end)
  isPrimary Boolean   @default(false) // primary contact for the unit
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id])
  unit Unit @relation(fields: [unitId], references: [id])

  @@unique([userId, unitId, role, startDate])
  @@index([unitId, endDate])
  @@index([userId, endDate])
}

// ─── SUB-COMMUNITIES ────────────────────────────────────────────

model SubCommunity {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  coverImage  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  memberships CommunityMembership[]
  polls       Poll[]
  events      Event[]
  files       FileEntry[]
}

enum CommunityRole {
  ADMIN
  MEMBER
}

model CommunityMembership {
  id             String        @id @default(cuid())
  userId         String
  subCommunityId String
  role           CommunityRole @default(MEMBER)
  joinedAt       DateTime      @default(now())

  user         User         @relation(fields: [userId], references: [id])
  subCommunity SubCommunity @relation(fields: [subCommunityId], references: [id])

  @@unique([userId, subCommunityId])
}

// ─── POLLS & VOTING ─────────────────────────────────────────────

enum PollScope {
  GLOBAL
  SUB_COMMUNITY
}

enum ResultVisibility {
  LIVE
  AFTER_CLOSE
}

model Poll {
  id               String           @id @default(cuid())
  title            String
  description      String?
  scope            PollScope
  subCommunityId   String?
  isAnonymous      Boolean          @default(false)
  resultVisibility ResultVisibility @default(LIVE)
  opensAt          DateTime
  closesAt         DateTime
  createdById      String
  createdAt        DateTime         @default(now())

  subCommunity SubCommunity? @relation(fields: [subCommunityId], references: [id])
  options      PollOption[]
  votes        Vote[]
}

model PollOption {
  id     String @id @default(cuid())
  pollId String
  label  String
  order  Int    @default(0)

  poll  Poll   @relation(fields: [pollId], references: [id], onDelete: Cascade)
  votes Vote[]
}

model Vote {
  id           String @id @default(cuid())
  pollId       String
  optionId     String
  userId       String
  votedAt      DateTime @default(now())

  poll   Poll       @relation(fields: [pollId], references: [id])
  option PollOption @relation(fields: [optionId], references: [id])
  user   User       @relation(fields: [userId], references: [id])

  @@unique([pollId, userId]) // one vote per user per poll
}

// ─── EVENTS & CALENDAR ──────────────────────────────────────────

enum EventScope {
  GLOBAL
  SUB_COMMUNITY
}

model Event {
  id             String     @id @default(cuid())
  title          String
  description    String?
  location       String?
  scope          EventScope
  subCommunityId String?
  startsAt       DateTime
  endsAt         DateTime
  createdById    String
  createdAt      DateTime   @default(now())

  subCommunity SubCommunity? @relation(fields: [subCommunityId], references: [id])
  rsvps        RSVP[]
}

enum RSVPStatus {
  ACCEPTED
  DECLINED
  MAYBE
}

model RSVP {
  id        String     @id @default(cuid())
  eventId   String
  userId    String
  status    RSVPStatus
  createdAt DateTime   @default(now())

  event Event @relation(fields: [eventId], references: [id])
  user  User  @relation(fields: [userId], references: [id])

  @@unique([eventId, userId])
}

// ─── FILE VAULT ─────────────────────────────────────────────────

model FileEntry {
  id             String   @id @default(cuid())
  subCommunityId String
  name           String
  mimeType       String
  sizeBytes      Int
  storageKey     String   // S3/R2 object key
  uploadedById   String
  createdAt      DateTime @default(now())

  subCommunity SubCommunity @relation(fields: [subCommunityId], references: [id])
}

// ─── VISITOR MANAGEMENT ─────────────────────────────────────────

enum VisitorType {
  GUEST
  DELIVERY
  DAILY_HELP
  CAB
  OTHER
}

enum PassStatus {
  ACTIVE
  USED
  EXPIRED
  CANCELLED
}

model VisitorPass {
  id           String      @id @default(cuid())
  userId       String      // resident who created it
  visitorName  String
  visitorPhone String?
  visitorType  VisitorType
  otp          String      // 6-digit code
  validFrom    DateTime
  validUntil   DateTime
  status       PassStatus  @default(ACTIVE)
  usedAt       DateTime?
  createdAt    DateTime    @default(now())

  user User @relation(fields: [userId], references: [id])
}

// ─── HELPDESK & TICKETING ───────────────────────────────────────

enum TicketCategory {
  PLUMBING
  ELECTRICAL
  CIVIL
  HOUSEKEEPING
  SECURITY
  OTHER
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model HelpTicket {
  id          String         @id @default(cuid())
  userId      String
  unitId      String?
  category    TicketCategory
  priority    TicketPriority @default(MEDIUM)
  subject     String
  description String
  status      TicketStatus   @default(OPEN)
  assignedTo  String?        // sub-community or specific user
  resolvedAt  DateTime?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  user     User            @relation(fields: [userId], references: [id])
  comments TicketComment[]
}

model TicketComment {
  id        String   @id @default(cuid())
  ticketId  String
  authorId  String
  body      String
  createdAt DateTime @default(now())

  ticket HelpTicket @relation(fields: [ticketId], references: [id])
}

// ─── FACILITY BOOKING ───────────────────────────────────────────

model Facility {
  id          String   @id @default(cuid())
  name        String   @unique  // "Tennis Court", "Clubhouse Hall A"
  description String?
  location    String?
  slotMinutes Int      @default(60) // booking granularity
  maxAdvDays  Int      @default(7)  // how far ahead one can book
  createdAt   DateTime @default(now())

  bookings FacilityBooking[]
}

model FacilityBooking {
  id         String   @id @default(cuid())
  facilityId String
  userId     String
  startsAt   DateTime
  endsAt     DateTime
  createdAt  DateTime @default(now())

  facility Facility @relation(fields: [facilityId], references: [id])

  @@index([facilityId, startsAt, endsAt])
}

// ─── NOTICE BOARD ───────────────────────────────────────────────

enum NoticePriority {
  NORMAL
  IMPORTANT
  EMERGENCY
}

model Notice {
  id          String         @id @default(cuid())
  title       String
  body        String
  priority    NoticePriority @default(NORMAL)
  publishedAt DateTime       @default(now())
  expiresAt   DateTime?
  createdById String
  createdAt   DateTime       @default(now())
}

// ─── DUES & PAYMENTS ────────────────────────────────────────────

enum DueStatus {
  PENDING
  PAID
  OVERDUE
  WAIVED
}

model Due {
  id          String    @id @default(cuid())
  unitId      String
  label       String    // "Maintenance Q1 2026"
  amount      Decimal   @db.Decimal(10,2)
  dueDate     DateTime
  status      DueStatus @default(PENDING)
  paidAt      DateTime?
  receiptUrl  String?
  createdAt   DateTime  @default(now())

  unit Unit @relation(fields: [unitId], references: [id])
}

// ─── AUDIT LOG ──────────────────────────────────────────────────

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  action     String   // "USER_APPROVED", "ROLE_ASSIGNED", "FILE_DELETED"
  entityType String   // "User", "UnitMembership", "FileEntry"
  entityId   String
  metadata   Json?    // additional context
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([entityType, entityId])
  @@index([userId, createdAt])
}
```

### 3.3 Key Design Decisions

| Decision | Rationale |
|---|---|
| `UnitMembership` with `startDate`/`endDate` | Enables historical tracking and automatic expiry. A cron job marks expired memberships, revoking access. `endDate = null` means "currently active with no planned end." |
| `@@unique([userId, unitId, role, startDate])` | Prevents duplicate memberships but allows the same user to have different roles on the same unit over time. |
| Separate `GlobalRole` vs `UnitRole` vs `CommunityRole` | Cleanly separates system-level admin powers from unit-level residency and from sub-community participation. |
| `Poll.scope` + nullable `subCommunityId` | One table handles both global and scoped polls. Queries filter by scope. |
| `AuditLog` with generic `entityType`/`entityId` | Flexible polymorphic pattern; avoids needing a separate log table per entity. |

---

## 4. Product Backlog (Prioritized)

### Priority Framework
- **P0 — Must-Have (MVP)**: Core access, security, basic admin operations
- **P1 — Should-Have**: Community engagement features
- **P2 — Nice-to-Have**: Operational add-ons
- **P3 — Future**: Payment integrations, advanced analytics

---

### EPIC 1: Public Landing Page & Marketing (P0)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E1-S1 | As a **visitor**, I want to see an attractive landing page with community images and amenity details so I can evaluate Gulshan Dynasty. | Hero section, amenity cards, location map, responsive design. |
| E1-S2 | As a **visitor**, I want to see a "Login / Register" CTA so I can access the resident portal. | Visible auth button; redirects to social login flow. |
| E1-S3 | As a **visitor**, I want the page to load fast and be SEO-optimized. | Lighthouse score ≥ 90 on Performance & SEO. |

---

### EPIC 2: Authentication & User Management (P0)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E2-S1 | As a **user**, I can sign up / sign in using Google or Apple accounts. | OAuth flow via Auth.js; account linked to User record. |
| E2-S2 | As a **new user**, after first login I see a "Pending Approval" screen and cannot access restricted areas. | `approvalStatus = PENDING`; middleware blocks access. |
| E2-S3 | As an **admin**, I can view a list of pending registrations and approve or reject them. | Admin dashboard with approve/reject buttons; sets `approvalStatus`. |
| E2-S4 | As an **admin**, I can assign Global Roles (Admin, Resident, Non-Resident) to users. | Role dropdown on user detail page; updates `globalRole`. |
| E2-S5 | As a **system**, I send an email notification when a user is approved. | Email triggered on approval. |
| E2-S6 | As an **admin**, I can deactivate a user account. | Soft-delete / deactivation flag; user is logged out. |

---

### EPIC 3: Units & Time-Bound RBAC (P0)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E3-S1 | As an **admin**, I can create and manage units (apartment/villa with block, floor, number). | CRUD interface for units. |
| E3-S2 | As an **admin**, I can assign a user to a unit with a specific role (Owner/Tenant/Family) and start/end dates. | UnitMembership created with date range. |
| E3-S3 | As an **admin**, I can assign multiple owners (Joint Owners) to a single unit. | Multiple OWNER/JOINT_OWNER memberships on same unit. |
| E3-S4 | As a **system**, memberships with a past `endDate` are automatically deactivated (access revoked). | Daily cron job checks and flags expired memberships. |
| E3-S5 | As a **user**, I can view my current unit(s) and role(s) on my profile. | Profile page shows active memberships. |
| E3-S6 | As an **admin**, I can view the full membership history of any unit. | Unit detail page shows timeline of all residents. |

---

### EPIC 4: Sub-Communities (Clubs/Groups) (P1)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E4-S1 | As an **admin**, I can create a sub-community with a name, description, and cover image. | CRUD for sub-communities. |
| E4-S2 | As an **admin**, I can assign Community Admin role to a user for a specific sub-community. | `CommunityMembership.role = ADMIN`. |
| E4-S3 | As a **community admin**, I can add/remove members to my sub-community. | Member management UI scoped to that community. |
| E4-S4 | As a **member**, I can see my sub-community's dedicated page (description, member list). | Sub-community detail page. |
| E4-S5 | As a **user**, I can browse a directory of all sub-communities and request to join. | Directory page with "Join" button (admin approval). |

---

### EPIC 5: Polling System (P1)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E5-S1 | As an **admin/community admin**, I can create a poll with a title, options, open/close dates, scope (global or sub-community). | Poll creation form with all config fields. |
| E5-S2 | As a **creator**, I can configure anonymous vs. named voting. | Toggle on creation; system enforces. |
| E5-S3 | As a **creator**, I can set result visibility to "Live" or "After Close". | Toggle on creation; UI respects setting. |
| E5-S4 | As an **eligible voter**, I can cast one vote on an active poll. | Vote recorded; duplicate prevented. |
| E5-S5 | As a **user**, I can see poll results (respecting visibility rules). | Results shown live or after close per config. |
| E5-S6 | As a **system**, polls auto-close at `closesAt` and results become visible. | Cron or edge function checks poll state. |

---

### EPIC 6: Calendar & Events (P1)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E6-S1 | As an **admin/community admin**, I can create an event with title, description, date/time, location, and scope. | Event creation form. |
| E6-S2 | As a **resident**, I see a unified calendar view showing global events + my sub-community events. | Calendar component with filtered data. |
| E6-S3 | As a **resident**, I can RSVP (Accept/Decline/Maybe) to an event. | RSVP button on event card; status persisted. |
| E6-S4 | As an **event creator**, I can see RSVP counts and attendee list. | Event detail shows breakdown. |

---

### EPIC 7: File Vault (P1)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E7-S1 | As a **community admin**, I can upload files (≤25 MB, PDF/DOCX/XLSX/images) to my sub-community's vault. | Presigned upload to S3/R2; metadata stored. |
| E7-S2 | As a **member**, I can view and download files from my sub-community's vault. | File listing with download links. |
| E7-S3 | As a **community admin**, I can delete files from the vault. | Delete button; removes from storage + DB. |

---

### EPIC 8: Visitor Management System (P2)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E8-S1 | As a **resident**, I can generate a visitor pass (guest name, phone, type, validity window). | Form → generates 6-digit OTP + QR code. |
| E8-S2 | As a **security guard**, I can validate a visitor's OTP/QR at the gate. | Validation endpoint; marks pass as USED. |
| E8-S3 | As a **resident**, I can view my active and past visitor passes. | History list with status. |
| E8-S4 | As a **system**, passes auto-expire after `validUntil`. | Cron marks expired passes. |

---

### EPIC 9: Helpdesk & Ticketing (P2)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E9-S1 | As a **resident**, I can raise a help ticket with category, priority, subject, and description. | Ticket creation form. |
| E9-S2 | As an **admin**, I can view all tickets and assign them to a sub-community or user. | Admin ticket dashboard with filters. |
| E9-S3 | As an **assignee**, I can update ticket status and add comments. | Status transitions + comment thread. |
| E9-S4 | As a **resident**, I can track my ticket's status and view comments. | Ticket detail page with timeline. |

---

### EPIC 10: Facility Booking (P2)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E10-S1 | As an **admin**, I can create and configure bookable facilities (name, slot duration, advance booking window). | Facility CRUD. |
| E10-S2 | As a **resident**, I can view available time slots for a facility. | Calendar/grid showing availability. |
| E10-S3 | As a **resident**, I can book an available slot. | Booking created; conflicts prevented. |
| E10-S4 | As a **resident**, I can cancel my upcoming bookings. | Cancel button; slot freed. |

---

### EPIC 11: Notice Board & Broadcasts (P2)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E11-S1 | As an **admin**, I can publish a notice (title, body, priority, expiry). | Notice creation form. |
| E11-S2 | As a **resident**, I see active notices on my dashboard, sorted by priority/date. | Notice feed with priority badges. |
| E11-S3 | As a **system**, emergency notices trigger email notifications to all approved users. | Email sent on `EMERGENCY` priority. |

---

### EPIC 12: Dues & Payments Ledger (P3)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E12-S1 | As an **admin**, I can generate dues (maintenance bills) for units with amount and due date. | Bulk/individual due creation. |
| E12-S2 | As a **resident**, I can view my unit's dues and payment history. | Dues listing with status badges. |
| E12-S3 | As an **admin**, I can mark a due as paid and attach a receipt. | Status update + file upload. |
| E12-S4 | As a **system**, overdue amounts are highlighted and reminder emails sent. | Cron checks due dates; sends reminders. |

---

### EPIC 13: Audit Logging & Admin Tools (P1)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E13-S1 | As a **system**, all admin actions (approve user, assign role, delete file) are logged. | AuditLog entries created automatically. |
| E13-S2 | As an **admin**, I can view a filterable audit log. | Audit log page with entity/user/date filters. |

---

### EPIC 14: Notifications & Communication (P1)

| ID | Story | Acceptance Criteria |
|---|---|---|
| E14-S1 | As a **user**, I receive in-app notifications for relevant events (approval, new poll, event invite). | Notification bell with unread count. |
| E14-S2 | As a **user**, I receive email notifications for critical actions. | Email templates for approval, event, ticket updates. |
| E14-S3 | As a **user**, I can manage my notification preferences. | Settings page with toggles per category. |

---

## 5. Suggested Sprint Plan (High-Level)

| Sprint | Duration | Epics | Milestone |
|---|---|---|---|
| Sprint 1 | 2 weeks | E1 (Landing Page), E2 (Auth) | Public site live, login works |
| Sprint 2 | 2 weeks | E3 (Units & RBAC) | Core access control in place |
| Sprint 3 | 2 weeks | E4 (Sub-Communities), E13 (Audit) | Community structure set up |
| Sprint 4 | 2 weeks | E5 (Polls), E6 (Events) | Engagement features live |
| Sprint 5 | 2 weeks | E7 (Files), E14 (Notifications) | Document management + alerts |
| Sprint 6 | 2 weeks | E8 (VMS), E11 (Notices) | Operational tools |
| Sprint 7 | 2 weeks | E9 (Helpdesk), E10 (Facility Booking) | Service management |
| Sprint 8 | 2 weeks | E12 (Dues), Polish & QA | Financial module + release prep |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | HTTPS everywhere, CSRF protection, input sanitization, rate limiting on auth endpoints |
| Performance | < 2s TTFB for portal pages, < 200ms API p95 latency |
| Accessibility | WCAG 2.1 AA compliance |
| Mobile | Responsive design; mobile-first for resident features |
| Data Privacy | GDPR-aware (data export/deletion on request); no PII in logs |
| Availability | 99.5% uptime target |
| Backup | Daily automated DB backups with 30-day retention |

---

## 7. Spec Gap Analysis (Second Pass)

### 7.1 Gaps Found & Resolutions

| # | Gap | Severity | Resolution |
|---|---|---|---|
| G1 | **No user profile edit flow.** Users can't update their name, phone, or avatar after registration. | Medium | Add E2-S7: "As a user, I can edit my profile (name, phone, avatar)." |
| G2 | **Security guard role is missing.** The VMS requires a guard to validate passes, but there's no role/auth for gate staff. They shouldn't have resident-level access. | High | Add a `SECURITY_STAFF` value to `GlobalRole`. Gate validation page requires only this role — no access to polls, files, etc. |
| G3 | **No "who lives where" directory.** Residents commonly need to look up neighbors (e.g., "who is in B-403?"). No story covers a resident-facing directory. | Medium | Add E3-S7: "As a resident, I can search/browse a unit directory showing current occupants (name + unit, not phone/email)." Privacy-safe: only names visible. |
| G4 | **VisitorPass has no link to the unit being visited.** Guard needs to know which flat the visitor is going to. | High | Add `unitId` (required) to `VisitorPass` model. |
| G5 | **FacilityBooking has no user relation.** Cannot query "my bookings" or enforce per-user booking limits. | High | Add `user User @relation(...)` to `FacilityBooking`. Also add `maxBookingsPerUser` to `Facility`. |
| G6 | **No cancellation policy for facility bookings.** Can a user cancel 1 minute before? | Medium | Add `minCancelMinutes` field to `Facility` (default 60). E10-S4 acceptance criteria updated: "Cancel allowed only if booking is > minCancelMinutes in the future." |
| G7 | **Poll doesn't support multi-select voting.** Some polls need "select up to 3" (e.g., "vote for 3 committee members"). | Medium | Add `maxChoices Int @default(1)` to `Poll`. Validation: `votes_count <= maxChoices`. |
| G8 | **No soft-delete / deactivation flag on User model.** E2-S6 mentions deactivation but schema has no field. | High | Add `isActive Boolean @default(true)` to `User`. Middleware checks `isActive` before granting access. |
| G9 | **HelpTicket.assignedTo is a String (ambiguous).** Could be a userId or subCommunityId — no referential integrity. | Medium | Split into `assignedToUserId String?` (FK to User) and `assignedToCommunityId String?` (FK to SubCommunity). |
| G10 | **No image/attachment support on HelpTickets.** Residents often need to upload a photo of the issue (e.g., leaking pipe). | Medium | Add `TicketAttachment` model (similar to FileEntry but linked to ticket). |
| G11 | **Notice has no target audience.** Spec says "global announcement" but some notices may target a specific block/tower only. | Low | Add optional `targetBlock String?` to `Notice`. If null, it's global. Phase-2: full audience targeting. |
| G12 | **No recurring events.** Community events like "Sunday Yoga" repeat weekly — currently must be created each time. | Low | Phase-2 enhancement. Add `recurrenceRule String?` (RFC 5545 RRULE) to Event model later. |
| G13 | **No password/email login fallback.** If a resident doesn't have Google/Apple, they can't access the portal (e.g., elderly residents). | Medium | Add email magic-link as a fallback auth method via Auth.js. No password to manage. |
| G14 | **Dues model lacks line-item granularity.** A single maintenance bill may include multiple components (maintenance + sinking fund + water charges). | Low | Phase-2: Add `DueLineItem` model. For MVP, `label` field is sufficient ("Maintenance Q1 2026 - ₹5,000"). |
| G15 | **No emergency contact / vehicle info on user profile.** Common in gated communities for security/parking. | Low | Add optional `emergencyContact String?` and `vehiclePlates String[]` to User. |
| G16 | **Sub-community join request has no model.** E4-S5 says "request to join" but there's no `JoinRequest` entity to track pending requests. | Medium | Add `CommunityJoinRequest` model with status (PENDING/APPROVED/REJECTED). |
| G17 | **File Vault is only per sub-community.** Society-wide documents (AGM minutes, bylaws, registration certificate) have no home. | Medium | Make `FileEntry.subCommunityId` nullable. When null, file belongs to the global society vault. Add E7-S4 for global file management. |
| G18 | **No rate limiting on OTP generation.** A malicious user could spam the VMS generating thousands of OTPs. | Medium | Add application-level rate limit: max 10 active passes per user at any time. |
| G19 | **Facility booking has no approval workflow.** Some facilities (e.g., clubhouse banquet hall) may need admin approval before confirmation. | Low | Add `requiresApproval Boolean @default(false)` to `Facility` and `status` enum (PENDING/CONFIRMED/REJECTED/CANCELLED) to `FacilityBooking`. |
| G20 | **No dashboard/home page defined for logged-in users.** After login, what does the user see? | Medium | Add E15: Resident Dashboard — a single story for a home page showing upcoming events, active notices, recent polls, and pending dues. |

### 7.2 Schema Patches (Applying High/Medium Gaps)

```prisma
// ─── PATCH: G2 — Security staff role ────────────────────────────
enum GlobalRole {
  SUPER_ADMIN
  ADMIN
  RESIDENT
  NON_RESIDENT
  SECURITY_STAFF   // NEW: gate validation only
}

// ─── PATCH: G8 — User deactivation ─────────────────────────────
// Add to User model:
//   isActive  Boolean @default(true)

// ─── PATCH: G4 — VisitorPass needs unit ─────────────────────────
// Add to VisitorPass model:
//   unitId    String
//   unit      Unit @relation(fields: [unitId], references: [id])

// ─── PATCH: G5 — FacilityBooking user relation ─────────────────
// Add to FacilityBooking model:
//   user      User @relation(fields: [userId], references: [id])
// Add to Facility model:
//   maxBookingsPerUser  Int @default(2)

// ─── PATCH: G6 — Cancellation policy ───────────────────────────
// Add to Facility model:
//   minCancelMinutes    Int @default(60)

// ─── PATCH: G7 — Multi-select polls ────────────────────────────
// Add to Poll model:
//   maxChoices  Int @default(1)
// Update Vote unique constraint:
//   @@unique([pollId, userId]) → remove (allow multiple votes)
//   Add validation: user's vote count per poll <= poll.maxChoices

// ─── PATCH: G9 — Ticket assignment clarity ──────────────────────
// Replace HelpTicket.assignedTo with:
//   assignedToUserId       String?
//   assignedToCommunityId  String?
//   assignedToUser         User?         @relation("TicketAssignee", fields: [assignedToUserId], references: [id])
//   assignedToCommunity    SubCommunity? @relation(fields: [assignedToCommunityId], references: [id])

// ─── PATCH: G10 — Ticket attachments ───────────────────────────
model TicketAttachment {
  id         String   @id @default(cuid())
  ticketId   String
  name       String
  mimeType   String
  sizeBytes  Int
  storageKey String
  createdAt  DateTime @default(now())

  ticket HelpTicket @relation(fields: [ticketId], references: [id])
}

// ─── PATCH: G15 — Emergency contact & vehicles ─────────────────
// Add to User model:
//   emergencyContactName  String?
//   emergencyContactPhone String?
//   vehiclePlates         String[]  // e.g. ["DL4CAF1234", "UP16AB5678"]

// ─── PATCH: G16 — Join requests ────────────────────────────────
enum JoinRequestStatus {
  PENDING
  APPROVED
  REJECTED
}

model CommunityJoinRequest {
  id             String            @id @default(cuid())
  userId         String
  subCommunityId String
  status         JoinRequestStatus @default(PENDING)
  reviewedById   String?
  createdAt      DateTime          @default(now())
  reviewedAt     DateTime?

  user         User         @relation(fields: [userId], references: [id])
  subCommunity SubCommunity @relation(fields: [subCommunityId], references: [id])

  @@unique([userId, subCommunityId, status])
}

// ─── PATCH: G17 — Global file vault ────────────────────────────
// Change FileEntry.subCommunityId to optional:
//   subCommunityId String?   // null = global society document

// ─── PATCH: G19 — Facility booking approval ────────────────────
enum BookingStatus {
  PENDING_APPROVAL
  CONFIRMED
  REJECTED
  CANCELLED
}

// Add to Facility:
//   requiresApproval Boolean @default(false)
// Add to FacilityBooking:
//   status BookingStatus @default(CONFIRMED)
```

### 7.3 New/Updated Backlog Items

| ID | Story | Epic | Priority |
|---|---|---|---|
| E2-S7 | As a **user**, I can edit my profile (name, phone, avatar, emergency contact, vehicle plates). | E2 | P0 |
| E3-S7 | As a **resident**, I can search a unit directory to find who lives in a specific flat (name only, privacy-safe). | E3 | P1 |
| E4-S6 | As a **user**, my join request is tracked and I'm notified when approved/rejected by the community admin. | E4 | P1 |
| E7-S4 | As an **admin**, I can upload/manage global society documents (bylaws, AGM minutes) in a society-wide vault. | E7 | P1 |
| E8-S5 | As a **system**, a user cannot have more than 10 active visitor passes at any time (rate limit). | E8 | P2 |
| E10-S5 | As a **facility admin**, I can mark a facility as "requires approval" and approve/reject booking requests. | E10 | P2 |
| E15-S1 | As a **resident**, after login I see a dashboard with: upcoming events, active notices, open polls, and my pending dues. | **E15 (new)** | P0 |
| E15-S2 | As an **admin**, after login I see an admin dashboard with: pending approvals count, open tickets count, and recent audit entries. | **E15 (new)** | P0 |
| E2-S8 | As a **user without Google/Apple**, I can log in via email magic link. | E2 | P0 |

### 7.4 Revised Sprint Plan (Reflecting Gaps)

| Sprint | Duration | Epics | Milestone |
|---|---|---|---|
| Sprint 1 | 2 weeks | E1 (Landing Page), E2 (Auth + Magic Link + Profile) | Public site live, login works for all users |
| Sprint 2 | 2 weeks | E3 (Units, RBAC, Directory), E15 (Dashboards) | Core access + resident home screen |
| Sprint 3 | 2 weeks | E4 (Sub-Communities + Join Requests), E13 (Audit) | Community structure fully operational |
| Sprint 4 | 2 weeks | E5 (Polls with multi-select), E6 (Events + Calendar) | Engagement features live |
| Sprint 5 | 2 weeks | E7 (Files — scoped + global), E14 (Notifications) | Document management + alerts |
| Sprint 6 | 2 weeks | E8 (VMS with rate limits), E11 (Notices with targeting) | Operational security tools |
| Sprint 7 | 2 weeks | E9 (Helpdesk + attachments), E10 (Facility Booking + approval) | Service management |
| Sprint 8 | 2 weeks | E12 (Dues), Polish, QA, Load Testing | Financial module + release prep |

---

---

## 8. Spec Gap Analysis (Third Pass — Workflows, Security, Operations)

This pass focuses on **workflow integrity**, **operational bootstrapping**, **concurrency/race conditions**, **data lifecycle**, and **permission matrix completeness**.

### 8.1 Gaps Found & Resolutions

| # | Gap | Category | Severity | Resolution |
|---|---|---|---|---|
| G21 | **No system bootstrap / first-admin problem.** When the app starts fresh, there are zero users and zero admins. Who approves the first admin? | Operations | **Critical** | Seed script creates the first SUPER_ADMIN via CLI (`npx prisma db seed` or a `/setup` one-time route protected by an env-var secret). Document this in deployment guide. |
| G22 | **No bulk import for units and residents.** A society has 500+ existing units — creating them one by one is impractical. | Operations | **High** | Add E3-S8: "As an admin, I can bulk-import units via CSV upload." Add E3-S9: "As an admin, I can bulk-import residents and assign them to units via CSV." |
| G23 | **Unit ownership transfer workflow is undefined.** When a flat is sold, the old owner's membership should end and the new owner's should begin. Currently an admin must manually close one and open another — error-prone. | Workflow | **High** | Add E3-S10: "As an admin, I can initiate an ownership transfer (closes old membership endDate=today, creates new membership startDate=today) in a single atomic operation." |
| G24 | **Tenant requires owner consent (not modeled).** In Indian societies, a tenant is only valid if the flat owner has given a No-Objection Certificate (NOC). | Workflow | **Medium** | Add `ownerConsentStatus` (PENDING/GRANTED/REVOKED) to `UnitMembership` where role=TENANT. Tenant access is blocked until consent is GRANTED. Notify the owner when a tenant membership is created. |
| G25 | **Poll eligibility is undefined.** For global polls: can tenants vote? Or only owners? For AGM resolutions, only one vote per unit is legally valid. | Business Logic | **High** | Add `eligibility` enum to Poll: `ALL_RESIDENTS`, `OWNERS_ONLY`, `ONE_PER_UNIT`. For ONE_PER_UNIT, system allows only one vote per unitId (first voter from that unit wins). |
| G26 | **Concurrent facility booking race condition.** Two users can simultaneously see the same slot as "available" and both submit — double booking. | Concurrency | **High** | Use a PostgreSQL advisory lock or `SELECT ... FOR UPDATE` in the booking transaction. The unique index `@@unique([facilityId, startsAt])` acts as a final guard. Add explicit constraint to schema. |
| G27 | **No Notification model in schema.** E14 references in-app notifications but there's no `Notification` table defined. | Schema | **High** | Add `Notification` model (userId, type, title, body, link, isRead, createdAt). |
| G28 | **VisitorPass: daily help needs recurring passes.** A maid/cook comes every day — generating a new pass daily is tedious. | Workflow | **Medium** | Add `isRecurring Boolean @default(false)` and `recurrenceDays String[]` (e.g., ["MON","TUE","WED","THU","FRI"]) to VisitorPass. Recurring passes auto-validate on specified days within the validity window. |
| G29 | **No event capacity or waitlist.** A yoga class may have 20 spots — unlimited RSVPs make it meaningless. | Feature | **Low** | Add `maxAttendees Int?` to Event. When RSVPs hit max, show "Full" and optionally add to waitlist. Phase-2. |
| G30 | **Facility blackout/maintenance periods.** Tennis court may be closed for resurfacing — no way to block bookings. | Feature | **Medium** | Add `FacilityBlackout` model (facilityId, startsAt, endsAt, reason). Booking validation rejects slots overlapping a blackout. |
| G31 | **Account linking is not addressed.** If a user registers with Google then later tries Apple (same email), do they get two accounts or one? | Auth | **Medium** | Auth.js handles this via the `allowDangerousEmailAccountLinking` option or manual account linking. Document decision: accounts with the same verified email are auto-linked. |
| G32 | **No session revocation on role change.** If an admin revokes a user's access or changes their role, the existing session remains valid until expiry. | Security | **High** | Implement session invalidation: on role change / deactivation, delete all sessions for that user. Middleware re-checks `isActive` + `approvalStatus` on every request (DB lookup, cached 60s). |
| G33 | **No permission matrix documented.** Each role's allowed actions are implicit — easy to have inconsistencies during implementation. | Architecture | **High** | Add explicit permission matrix (Section 8.2 below). |
| G34 | **Audit log has no retention policy.** Logs grow indefinitely. | Operations | **Low** | Add cron: archive audit logs older than 2 years to cold storage (or just compress). For MVP, no action needed (100 entries/day × 2 years = ~73K rows, trivial). |
| G35 | **No data export capability.** For AGMs, the treasurer needs dues reports; the secretary needs member lists. | Feature | **Medium** | Add E13-S3: "As an admin, I can export data (members, dues, tickets) as CSV/PDF." Uses server-side generation. |
| G36 | **No "forgot which email I used" recovery.** Residents may not remember if they signed up with Google or Apple. | Auth/UX | **Low** | On login page, add "Enter your email to see available sign-in methods" — query accounts table and show which providers are linked. |
| G37 | **Due is per-unit but notification should go to the primary contact.** If a unit has 3 owners, who gets the reminder email? | Workflow | **Medium** | Send to all active members with `isPrimary=true`. If no primary is set, send to all owners. Schema already has `isPrimary` — just document the notification logic. |
| G38 | **No "read receipt" for notices.** Admin has no way to know if critical notices (e.g., water shutoff) were actually seen. | Feature | **Low** | Phase-2: Add `NoticeRead` model (noticeId, userId, readAt). Show admin a "read by X/Y residents" count. |
| G39 | **Mobile experience for security guard is critical but not called out.** Guards use basic Android phones — the VMS validation page must be a lightweight, fast-loading PWA. | UX | **Medium** | E8 acceptance criteria should specify: validation page is a standalone PWA-capable route, < 50KB JS, works offline for OTP entry (validates against cached pass data). |
| G40 | **No cascading delete rules defined.** What happens when an admin deletes a sub-community? Are all polls, events, files orphaned? | Data Lifecycle | **High** | Define cascade rules: SubCommunity deletion → soft-delete (set `isArchived=true`) rather than hard delete. Files/polls/events remain accessible in read-only "archived" state. Add `isArchived Boolean @default(false)` to SubCommunity. |

### 8.2 Permission Matrix

| Action | SUPER_ADMIN | ADMIN | COMMUNITY_ADMIN (scoped) | RESIDENT (Owner/Tenant) | FAMILY | NON_RESIDENT | SECURITY_STAFF |
|---|---|---|---|---|---|---|---|
| Approve/reject users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign global roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage units (CRUD) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign unit memberships | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create sub-community | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage sub-community members | ✅ | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Create global poll | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create scoped poll | ✅ | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Vote in poll | ✅ | ✅ | ✅ | ✅ (per eligibility) | ❌ | ❌ | ❌ |
| Create global event | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create scoped event | ✅ | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| RSVP to event | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Upload files (scoped) | ✅ | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ❌ |
| Download files (scoped) | ✅ | ✅ | ✅ (own) | ✅ (if member) | ✅ (if member) | ❌ | ❌ |
| Generate visitor pass | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Validate visitor pass | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Raise help ticket | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign/manage tickets | ✅ | ✅ | ✅ (own community tickets) | ❌ | ❌ | ❌ | ❌ |
| Book facility | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Publish notice | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View notice | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage dues | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View own dues | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View audit log | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Export data | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Key rules:**
- `FAMILY` members can consume content and raise tickets but cannot vote in polls or book facilities.
- `SECURITY_STAFF` has a single-purpose interface: validate visitor passes. Nothing else.
- `COMMUNITY_ADMIN` powers are **scoped** — they can only manage their own sub-community.
- `SUPER_ADMIN` can do everything an ADMIN can, plus assign the ADMIN role to others.

### 8.3 Additional Schema Patches (Third Pass)

```prisma
// ─── PATCH: G21 — Bootstrap ─────────────────────────────────────
// No schema change. Handled via seed script + env var SETUP_SECRET.

// ─── PATCH: G24 — Tenant owner consent ──────────────────────────
enum ConsentStatus {
  NOT_REQUIRED  // for OWNER, FAMILY roles
  PENDING
  GRANTED
  REVOKED
}
// Add to UnitMembership:
//   ownerConsent ConsentStatus @default(NOT_REQUIRED)

// ─── PATCH: G25 — Poll eligibility ─────────────────────────────
enum PollEligibility {
  ALL_RESIDENTS      // anyone with active unit membership
  OWNERS_ONLY        // only OWNER + JOINT_OWNER roles
  ONE_PER_UNIT       // one vote per unit (first voter per unit wins)
}
// Add to Poll:
//   eligibility PollEligibility @default(ALL_RESIDENTS)

// ─── PATCH: G26 — Booking conflict prevention ───────────────────
// Add to FacilityBooking:
//   @@unique([facilityId, startsAt]) // DB-level guard against double booking

// ─── PATCH: G27 — Notification model ────────────────────────────
enum NotificationType {
  APPROVAL_GRANTED
  APPROVAL_REJECTED
  NEW_POLL
  POLL_CLOSED
  NEW_EVENT
  EVENT_REMINDER
  TICKET_UPDATE
  VISITOR_ARRIVED
  DUE_REMINDER
  NOTICE_PUBLISHED
  COMMUNITY_JOIN_APPROVED
  GENERAL
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  body      String?
  link      String?          // deep link to relevant page
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, isRead, createdAt])
}

// ─── PATCH: G28 — Recurring visitor passes ──────────────────────
// Add to VisitorPass:
//   isRecurring    Boolean  @default(false)
//   recurrenceDays String[] // ["MON","TUE","WED","THU","FRI","SAT","SUN"]

// ─── PATCH: G30 — Facility blackout ─────────────────────────────
model FacilityBlackout {
  id         String   @id @default(cuid())
  facilityId String
  reason     String
  startsAt   DateTime
  endsAt     DateTime
  createdAt  DateTime @default(now())

  facility Facility @relation(fields: [facilityId], references: [id])

  @@index([facilityId, startsAt, endsAt])
}

// ─── PATCH: G40 — Soft-delete for sub-communities ───────────────
// Add to SubCommunity:
//   isArchived Boolean @default(false)
```

### 8.4 New Backlog Items (Third Pass)

| ID | Story | Epic | Priority |
|---|---|---|---|
| E3-S8 | As an **admin**, I can bulk-import units via CSV upload (columns: unitNumber, block, floor, type, area). | E3 | P0 |
| E3-S9 | As an **admin**, I can bulk-import residents via CSV and auto-create unit memberships. | E3 | P0 |
| E3-S10 | As an **admin**, I can perform an ownership transfer (atomic close-old + create-new membership). | E3 | P1 |
| E5-S7 | As an **admin**, I can set poll eligibility (All Residents / Owners Only / One Per Unit). | E5 | P1 |
| E8-S6 | As a **resident**, I can create a recurring visitor pass for daily help (select days of week). | E8 | P2 |
| E10-S6 | As an **admin**, I can set blackout periods on a facility (no bookings during maintenance). | E10 | P2 |
| E13-S3 | As an **admin**, I can export member lists, dues reports, and ticket summaries as CSV. | E13 | P1 |
| E0-S1 | As a **deployer**, I can run a seed script that creates the first SUPER_ADMIN account using a setup secret. | **E0 (Infra)** | P0 |
| E0-S2 | As a **deployer**, I have a Docker Compose file that starts all services (app, DB, MinIO) locally. | **E0 (Infra)** | P0 |

### 8.5 Final Revised Sprint Plan (v1.2)

| Sprint | Duration | Epics & Key Stories | Milestone |
|---|---|---|---|
| Sprint 0 | 1 week | E0 (Infra: Docker Compose, seed script, CI pipeline, Coolify setup) | Dev environment operational |
| Sprint 1 | 2 weeks | E1 (Landing Page), E2 (Auth: Google + Apple + Magic Link + Profile) | Public site live, all auth methods work |
| Sprint 2 | 2 weeks | E3 (Units, RBAC, Bulk Import, Directory), E15 (Dashboards) | Core access control + home screens |
| Sprint 3 | 2 weeks | E4 (Sub-Communities + Join Requests), E13 (Audit + Export) | Community structure operational |
| Sprint 4 | 2 weeks | E5 (Polls: multi-select, eligibility), E6 (Events + Calendar) | Engagement features live |
| Sprint 5 | 2 weeks | E7 (Files: scoped + global), E14 (Notifications + Preferences) | Document management + alerts |
| Sprint 6 | 2 weeks | E8 (VMS: recurring passes, rate limits, PWA guard UI), E11 (Notices) | Security & operational tools |
| Sprint 7 | 2 weeks | E9 (Helpdesk + attachments), E10 (Facility: approval, blackouts) | Service management |
| Sprint 8 | 2 weeks | E12 (Dues), Polish, Security Audit, Load Testing | Financial module + release |

### 8.6 Remaining Acceptable Deferrals (Phase 2)

These are acknowledged gaps intentionally deferred:

| Item | Reason for Deferral |
|---|---|
| Recurring events (RRULE) | Complexity; manual weekly creation is acceptable for v1 |
| Event capacity + waitlist | Low priority; most society events don't cap attendance |
| Notice read receipts | Nice-to-have analytics |
| Dues line-item granularity | Single label string is sufficient for MVP |
| Payment gateway (Razorpay) | Needs legal/compliance work; ledger is enough |
| SMS/Push notifications | Cost implications; email + in-app covers v1 |
| Multi-tenant (SaaS) | Major refactor; not needed for single-society deploy |
| Real-time chat | Over-engineered for v1; WhatsApp fills this gap organically |
| Audit log archival | Data volume is negligible for years |
| "Forgot which email" flow | Edge case; can be handled manually by admin |

---

---

## 9. Spec Gap Analysis (Fourth Pass — Context-Specific, Consistency, UX Flows)

This pass applies the **now-concrete property context** (204 units, 3 towers, ultra-luxury, specific amenities) and audits for **internal consistency**, **missing UX flows**, and **India-specific legal/operational gaps**.

### 9.1 Gaps Found & Resolutions

| # | Gap | Category | Severity | Resolution |
|---|---|---|---|---|
| G41 | **Amenity list conflates bookable facilities with property features.** "Contactless Homes (Separate service entries)" is a property feature, not a bookable amenity. The Facility seed should not include it. | Data/Seed | **Medium** | Split amenities into bookable (6) vs. feature descriptors (1). Only seed Facility records for: Pool & Sun Deck, Rooftop Recreation & Sky Deck, Spa & Wellness Center, Mini Theatre, Amphitheater, Cricket Pitch, Skating Rink. "Hydroponic Farm" is viewable/visitable, not slot-bookable — make it a sub-community ("Farm Club") instead. |
| G42 | **Hosting capacity estimate still says "500 residents"** in Section 2.3, but actual max is ~204 units × ~4 people = ~816 users (including family). Peak concurrent is even lower for 204 units. | Consistency | **Low** | Update text to reflect 204 units / ~600-800 registered users / peak ~30-50 concurrent. |
| G43 | **No parking management.** Ultra-luxury 4BHK apartments typically have 2-3 reserved parking spots per unit. Visitor parking is also relevant for VMS. | Feature | **Medium** | Add `parkingSlots` field to `Unit` model (default 2). Add `parkingSlot String?` to `VisitorPass` so guard knows where to direct the visitor's vehicle. Full parking management (swap/rent slots) is Phase-2. |
| G44 | **No move-in/move-out coordination.** Gated communities restrict moving times (e.g., only 9 AM–5 PM weekdays, no lifts blocked on weekends). When an ownership transfer happens (G23), the new resident needs to schedule their move. | Workflow | **Low** | Phase-2: Add as a Facility booking type or a special ticket category. For MVP, this is handled via the helpdesk. |
| G45 | **Landing page sections not defined.** We have images and design direction but no wireframe-level breakdown of what sections appear in what order. | UX | **Medium** | Define landing page sections (see Section 9.2 below). |
| G46 | **No "Contact Us" / enquiry form on the landing page.** Prospective residents need a way to reach the society office without logging in. | UX | **Medium** | Add E1-S4: "As a visitor, I can submit a contact enquiry (name, email, phone, message) without logging in." Stored in a simple `Enquiry` table; admin gets email notification. |
| G47 | **Auth flow doesn't collect unit information during onboarding.** After Google/Apple login, the admin must manually find and link the user to a unit. The user could self-declare their unit during registration (admin verifies). | Workflow | **Medium** | Add an onboarding step post-registration: user selects their tower + floor + unit from a dropdown. This becomes a "claim" that admin approves — linking it to unit membership. Avoids admin guessing who is in which flat. |
| G48 | **No WhatsApp integration for OTP delivery (VMS).** In India, residents share visitor OTPs via WhatsApp — the system should generate a shareable message/link. | UX | **Medium** | Add a "Share via WhatsApp" deep link button on the visitor pass screen: `https://wa.me/?text=...` with pre-filled message containing OTP + community name + unit. No API cost — just a client-side link. |
| G49 | **Email volume calculation is wrong.** With 204 units and 3K emails/month free tier: due reminders (204/mo) + approvals (~5/mo) + poll notifications (204×2/mo) + ticket updates (~50/mo) + emergency notices (~5×204) = could spike to ~1,700 on a busy month. Fine for free tier, but an AGM poll notification to all 600+ users eats 20% of the monthly quota in one blast. | Operations | **Medium** | Implement email batching/throttling. Non-urgent emails (reminders, poll notifications) are queued and sent in batches of 100/hour. Emergency notices bypass throttle. Add monitoring: if >80% of monthly quota used, switch to digest mode. |
| G50 | **No tower-level filtering in the portal.** With 3 distinct towers, residents may want to filter notices, directory, or polls by their tower. Tower-specific issues (e.g., "Tower B lift maintenance") are common. | UX | **Medium** | Ensure all list views (notices, directory, tickets) support tower filter. The `Unit.block` field already enables this. Add a "My Tower" quick-filter to the dashboard. |
| G51 | **Facility booking doesn't account for shared facilities with capacity > 1.** The pool allows 20 people simultaneously — it's not a single-slot exclusive booking. | Feature | **High** | Add `capacity Int @default(1)` to `Facility`. For capacity > 1, multiple bookings can exist for the same slot. Validation: count existing bookings for slot < capacity. Pool = capacity 20, Theatre = capacity 1 (exclusive). |
| G52 | **No "intercom directory" — flat-to-flat communication.** Residents sometimes need to contact their neighbors (e.g., water leak from upstairs). Currently no way to message another resident without knowing their email. | UX | **Low** | Phase-2: Add an in-app "contact resident" flow that sends an anonymized notification ("A resident from A-0802 wants to reach you") without exposing personal details. For MVP, the unit directory shows names — residents can coordinate via the admin. |
| G53 | **RWA/Society legal context not captured.** Indian Resident Welfare Associations have AGM requirements, quorum rules (typically 51% or as per bye-laws), and committee elections. The polling system should support formal resolutions. | Business Logic | **Medium** | Add `isResolution Boolean @default(false)` and `quorumPercentage Int?` to `Poll`. For resolutions, system tracks participation rate and flags if quorum not met. Results include "Quorum: Met (67%) / Not Met (42%)". |
| G54 | **No committee/designation model.** Indian RWAs have formal positions: President, Secretary, Treasurer, Committee Members. These are time-bound (annual elections). | Feature | **Medium** | Add `Designation` model (userId, title, startDate, endDate). Displayed on profile and in the "RWA Committee" section of the portal. Admins manage this. |
| G55 | **Seed script generates units but doesn't seed demo data for development.** Developers need realistic test data (users, memberships, polls, events) to work with. | DevEx | **Medium** | Seed script has two modes: `--prod` (just units + first admin) and `--dev` (units + 20 fake users + sample memberships + demo poll + demo event + demo notices). |
| G56 | **No "terms of use" / privacy policy acceptance on first login.** For GDPR/IT Act compliance, users should explicitly consent before accessing the portal. | Legal/Compliance | **Medium** | Add `termsAcceptedAt DateTime?` to User. After first OAuth login, show terms acceptance screen. User cannot proceed until accepted. |
| G57 | **Image optimization not addressed.** Hero images are large .webp/.jpg files from external URLs. On self-hosted infra, there's no automatic image optimization (unlike Vercel's built-in optimizer). | Performance | **Medium** | Use **Sharp** (MIT) via Next.js built-in `<Image>` component for local optimization. For external URLs, configure `remotePatterns` in `next.config.js`. Alternatively, proxy through Cloudflare's free Polish/image resizing. |
| G58 | **No "do not disturb" or quiet hours for notifications.** Residents shouldn't get non-emergency notifications at 2 AM. | UX | **Low** | Phase-2: Add `quietHoursStart` and `quietHoursEnd` to user preferences. Notifications queued during quiet hours are delivered at `quietHoursEnd`. |
| G59 | **Guard validation page needs offline support.** If the internet drops at the gate, the guard should still be able to validate pre-cached passes. | Resilience | **Medium** | Implement as a PWA with service worker. Cache active passes for the day on page load. OTP validation works offline against cached data. Sync when back online. |
| G60 | **No API versioning or rate limiting strategy defined.** All Next.js route handlers are unprotected — a script could hammer the API. | Security | **High** | Add middleware-level rate limiting: 100 req/min per authenticated user, 20 req/min for unauthenticated. Use an in-memory store (Map with TTL) — sufficient for 204 units. Document API conventions. |

### 9.2 Landing Page Section Breakdown (Resident-Focused)

| Order | Section | Content | Image Asset |
|---|---|---|---|
| 1 | **Hero** | Full-bleed community image, "Welcome to Gulshan Dynasty", subtitle: "Your community. Your people. Your portal.", CTA: "Resident Login" | `banner-1.webp` or `overview.webp` |
| 2 | **Quick Access** | Card grid: Book Amenity, Raise Ticket, Create Visitor Pass, View Notices (links to login if not authenticated) | Icons (Lucide) |
| 3 | **Our Community** | Stats bar (5.8 acres, 3 towers, 204 homes), brief description, gallery carousel | `gallery-1..5.webp` |
| 4 | **Amenities** | Bookable amenities cards (Pool, Spa, Theatre, Cricket, Skating, Rooftop) with "Book Now" CTAs | `key-1..4.webp` |
| 5 | **Clubs & Groups** | Preview of active sub-communities with member counts, "Join" CTAs | — |
| 6 | **Notices Preview** | Latest 2–3 active society notices (read-only, to show portal value to logged-out users) | — |
| 7 | **Contact RWA** | Simple form for non-residents/vendors needing to reach the RWA (not a sales enquiry) | — |
| 8 | **Footer** | RWA address, RWA email, privacy policy, terms of use, "Gulshan Dynasty Residents' Welfare Association" | `logo.webp` |

### 9.3 Additional Schema Patches (Fourth Pass)

```prisma
// ─── PATCH: G43 — Parking ───────────────────────────────────────
// Add to Unit:
//   parkingSlots  Int @default(2)
// Add to VisitorPass:
//   parkingSlot   String?  // e.g., "Visitor-P3" or null if walking

// ─── PATCH: G46 — Enquiry form ──────────────────────────────────
model Enquiry {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

// ─── PATCH: G47 — Unit claim during onboarding ─────────────────
enum ClaimStatus {
  PENDING
  APPROVED
  REJECTED
}
// Add to User:
//   claimedUnitId  String?  // unit they claim to belong to
//   claimStatus    ClaimStatus?

// ─── PATCH: G51 — Facility capacity ────────────────────────────
// Add to Facility:
//   capacity  Int @default(1)  // 1 = exclusive booking, >1 = shared (e.g., pool)

// ─── PATCH: G53 — Poll quorum for RWA resolutions ──────────────
// Add to Poll:
//   isResolution      Boolean @default(false)
//   quorumPercentage  Int?    // e.g., 51 means 51% participation required

// ─── PATCH: G54 — RWA Committee designations ───────────────────
model Designation {
  id        String    @id @default(cuid())
  userId    String
  title     String    // "President", "Secretary", "Treasurer", "Committee Member"
  startDate DateTime
  endDate   DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, endDate])
}

// ─── PATCH: G56 — Terms acceptance ─────────────────────────────
// Add to User:
//   termsAcceptedAt  DateTime?

// ─── PATCH: G60 — Rate limiting ────────────────────────────────
// No schema change. Implemented as middleware with in-memory Map.
```

### 9.4 New Backlog Items (Fourth Pass)

| ID | Story | Epic | Priority |
|---|---|---|---|
| E1-S4 | As a **visitor**, I can submit a contact enquiry without logging in. Admin is notified by email. | E1 | P0 |
| E1-S5 | As a **visitor**, I see the landing page with: hero, about, gallery, amenities, green living, location map, contact form, footer — in Art Deco style. | E1 | P0 |
| E2-S9 | As a **new user**, after first login I must accept terms of use / privacy policy before proceeding. | E2 | P0 |
| E2-S10 | As a **new user**, during onboarding I can claim my unit (select tower/floor/unit) for admin verification. | E2 | P1 |
| E10-S7 | As a **system**, shared-capacity facilities (pool, gym) allow multiple concurrent bookings up to the capacity limit. | E10 | P2 |
| E5-S8 | As an **admin**, I can mark a poll as a formal RWA resolution with quorum requirement, and the system reports whether quorum was met. | E5 | P1 |
| E16-S1 | As an **admin**, I can manage RWA committee designations (President, Secretary, etc.) with term dates. | **E16 (new)** | P1 |
| E16-S2 | As a **resident**, I can see the current RWA committee on a dedicated page. | **E16 (new)** | P1 |
| E0-S3 | As a **developer**, the seed script has a `--dev` mode that generates realistic test data (users, memberships, polls, events). | E0 | P0 |
| E0-S4 | As a **deployer**, rate limiting middleware (100 req/min auth, 20 req/min unauth) is active by default. | E0 | P0 |

### 9.5 Consistency Fixes Applied

| Item | Was | Now |
|---|---|---|
| Section 2.3 resident estimate | "500-resident community portal" | "~200-unit / ~600-user community portal" |
| Peak concurrent users | "~50-100" | "~30-50" |
| Facility model | Single-occupancy only | `capacity` field supports shared facilities |
| Amenity seed list | 7 items (including "Contactless Homes") | 7 bookable facilities (Contactless Homes removed, Hydroponic Farm treated as sub-community) |
| File upload in Build vs Reuse | "Supabase Storage SDK" | "MinIO SDK (S3-compatible)" — matches self-hosted decision |
| Email free tier adequacy | "Yes for low-volume" | Documented with actual volume calculation (~1,700/mo normal, spikes during AGM) |

### 9.6 Final Updated Sprint Plan (v1.3)

| Sprint | Duration | Epics & Key Additions | Milestone |
|---|---|---|---|
| Sprint 0 | 1 week | E0 (Docker Compose, seed script with --dev mode, rate limiting, CI) | Dev environment operational with test data |
| Sprint 1 | 2 weeks | E1 (Landing: all 8 sections, Art Deco, enquiry form), E2 (Auth: Google + Apple + Magic Link + Terms) | Public site live with enquiry, all auth methods |
| Sprint 2 | 2 weeks | E3 (Units auto-seeded, RBAC, unit claim onboarding, bulk import, directory), E15 (Dashboards with tower filter) | Access control + resident home screen |
| Sprint 3 | 2 weeks | E4 (Sub-Communities + Join Requests), E13 (Audit + Export), E16 (RWA Committee) | Community governance operational |
| Sprint 4 | 2 weeks | E5 (Polls: multi-select, eligibility, resolutions + quorum), E6 (Events + Calendar) | Decision-making + engagement live |
| Sprint 5 | 2 weeks | E7 (Files: scoped + global), E14 (Notifications + Preferences + email throttle) | Document management + alerts |
| Sprint 6 | 2 weeks | E8 (VMS: recurring, rate limits, WhatsApp share, PWA guard, parking), E11 (Notices + tower targeting) | Security & operational tools |
| Sprint 7 | 2 weeks | E9 (Helpdesk + attachments), E10 (Facility: capacity, approval, blackouts) | Service management |
| Sprint 8 | 2 weeks | E12 (Dues), Security audit, PWA offline validation, Load testing, Polish | Financial module + hardening + release |

### 9.7 Remaining Deferrals Updated (Phase 2)

| Item | Reason |
|---|---|
| Recurring events (RRULE) | Complexity; manual creation acceptable |
| Event capacity + waitlist | Low priority for 204-unit community |
| Notice read receipts | Analytics nice-to-have |
| Dues line-item granularity | Single label sufficient |
| Payment gateway (Razorpay) | Legal/compliance work needed |
| SMS/Push notifications | Cost; email + in-app covers v1 |
| Move-in/move-out scheduling | Use helpdesk for MVP |
| Inter-flat messaging | Privacy concerns; use admin as intermediary |
| Parking slot swap/rental | Edge case for v1 |
| Quiet hours for notifications | Low impact for 204 units |
| Multi-tenant SaaS | Not needed for single society |
| Real-time chat | WhatsApp fills this gap |

---

---

## 10. Spec Gap Analysis (Fifth Pass — Internal Contradictions, Schema Correctness, Technical Completeness)

This pass is a **consistency audit** — checking that patches from passes 2–4 don't contradict the base schema, that all workflows have complete technical paths, and that no implementation blockers remain.

### 10.1 Internal Contradictions Found & Fixed

| # | Contradiction | Sections | Fix |
|---|---|---|---|
| C1 | **Vote unique constraint conflicts with multi-select (G7).** Base schema (line 507) has `@@unique([pollId, userId])` enforcing one vote per user. G7 patch says "remove this" for multi-select. But removing it entirely allows voting for the same option twice. | §3.2 vs §7.2 | Correct constraint: `@@unique([pollId, optionId, userId])` — prevents duplicate votes on same option, but allows multiple option selections. App-level validation enforces `count <= poll.maxChoices`. |
| C2 | **Section 2.5 still references "Supabase Storage"** as the S3 replacement, but core stack (§2.1) uses MinIO. | §2.1 vs §2.5 | Update §2.5: replace "Supabase Storage" with "MinIO (self-hosted, S3-compatible)". |
| C3 | **SaaS fallback table header** still says "Sufficient for ~500 residents?" | §2.3.1 | Update to "Sufficient for 204-unit community?" |
| C4 | **FileEntry.subCommunityId is required** in base schema (§3.2, line 556) but G17 patch says "make it nullable". The base schema was never updated. | §3.2 vs §7.2 | Flag: base schema §3.2 is the "original" and patches are additive. When scaffolding, apply all patches. Document this clearly. |
| C5 | **HelpTicket still has `assignedTo String?`** in the base schema (line 634) even though G9 patch splits it. Same issue as C4 — patches are additive. | §3.2 vs §7.2 | Same resolution: patches override base. Add a note at the top of §3.2 stating patches in §7.2, §8.3, §9.3 must be applied. |
| C6 | **Due model sends reminder to "unit"** but doesn't know which member to email. G37 (§9) says "send to isPrimary members" but this logic isn't in any story. | §8.6 cron vs §7.3 | Already in E12-S4 acceptance criteria. Add explicit note: "email sent to all active UnitMembership records with isPrimary=true for that unit". |
| C7 | **Guard auth method undefined.** G2 adds SECURITY_STAFF role, E8-S2 requires guard to validate, G59 requires offline PWA. But: How does a guard log in? They likely don't have Google/Apple on a shared gate tablet. | §7.1 vs §8.1 vs §9.1 | Add PIN-based session for SECURITY_STAFF: admin generates a 6-digit staff PIN during user creation. Guard enters PIN on gate device → starts a long-lived session (30 days). No OAuth needed. |

### 10.2 Missing Technical Specifications

| # | Missing Item | Category | Resolution |
|---|---|---|---|
| T1 | **URL/routing structure not defined.** What's the app URL? How are public vs. portal routes separated? | Architecture | Define route map (see §10.3 below). Domain: `portal.gulshandynasty.com` (or whichever domain is available). |
| T2 | **Timezone handling not specified.** All `DateTime` fields — are they stored as UTC? Displayed in IST? | Schema | All DateTimes stored as UTC in PostgreSQL. Displayed in `Asia/Kolkata` (IST, UTC+5:30) on the frontend. Next.js middleware or a shared util handles conversion. No user-level timezone setting needed (single-society, single timezone). |
| T3 | **Search/filtering strategy undefined.** With 204 units and ~800 users, can we get away without a search engine? | Performance | Yes. PostgreSQL `ILIKE` + `tsvector` full-text search is sufficient for this scale. No Elasticsearch/Meilisearch needed. Add `@@index` on searchable text columns (User.name, Unit.unitNumber, HelpTicket.subject). |
| T4 | **Error handling conventions not defined.** How do API errors surface to the user? | DX | Standardize: API returns `{ success: boolean, data?, error?: { code, message } }`. Frontend uses React Error Boundaries for unexpected crashes. Form validation errors shown inline via Zod + React Hook Form. |
| T5 | **Testing strategy not defined.** What gets tested? | QA | Define: Unit tests for RBAC logic + time-bound membership checks (Vitest). Integration tests for critical API flows (auth, booking conflict, vote validation). E2E tests for happy paths (Playwright). No coverage mandate — focus on business logic correctness. |
| T6 | **Disaster recovery plan absent.** What if the Oracle VM dies? | Operations | Daily pg_dump → compressed → uploaded to Cloudflare R2 (10GB free). MinIO data also synced weekly to R2. Recovery: spin new VM, restore from R2. RTO: ~2 hours. RPO: 24 hours. Document runbook. |
| T7 | **Environment variables inventory not defined.** What secrets does the app need? | DevOps | Document required env vars (see §10.4 below). |
| T8 | **No loading/empty/error states specified for UI.** What does a resident see when there are zero polls? Zero events? | UX | Each list view must have: skeleton loader (loading), empty state with illustration + CTA (empty), error message with retry (error). Add as acceptance criteria to all list-based stories. |
| T9 | **Notification deduplication undefined.** If a user is in 3 sub-communities and a global event is created, do they get 1 or 3 notifications? | Logic | One notification per user per triggering event. Deduplication key: `(userId, type, entityId)`. If a notification with the same key exists within 5 minutes, skip it. |
| T10 | **Session duration / auto-logout not specified.** How long before a user is logged out? | Security | Default session: 30 days (remember me). SECURITY_STAFF sessions: 30 days (shared device). Admin sessions: 7 days (more sensitive). Configurable via Auth.js `maxAge`. |

### 10.3 Route Map

```
/ ........................... Landing page (public, SSG)
/contact .................... Enquiry form (public)
/login ...................... Auth page (Google/Apple/Magic Link)
/onboarding ................. Terms acceptance + unit claim (post-first-login)
/pending .................... "Awaiting approval" holding page

/dashboard .................. Resident home (notices, events, polls, dues)
/directory .................. Unit directory with tower filter
/profile .................... Edit profile, vehicles, emergency contact
/notifications .............. In-app notification list

/communities ................ Sub-community directory
/communities/[id] ........... Sub-community detail (members, polls, events, files)
/communities/[id]/polls ..... Scoped polls
/communities/[id]/events .... Scoped events
/communities/[id]/files ..... Scoped file vault

/polls ...................... Global polls list
/polls/[id] ................. Poll detail + vote
/events .................... Global events + calendar view
/events/[id] ................ Event detail + RSVP

/visitors ................... My visitor passes (create, list, share)
/visitors/[id] .............. Pass detail + QR + WhatsApp share

/tickets .................... My help tickets
/tickets/new ................ Raise a ticket
/tickets/[id] ............... Ticket detail + comments

/facilities ................. Bookable amenities list
/facilities/[id] ............ Availability grid + book
/facilities/[id]/bookings ... My bookings for this facility

/dues ....................... My unit's dues & payment history

/files ...................... Global society documents vault

/committee .................. RWA committee page

/admin ...................... Admin dashboard
/admin/users ................ User management (approve, roles, deactivate)
/admin/units ................ Unit management (CRUD, bulk import, transfers)
/admin/communities .......... Sub-community management
/admin/notices .............. Notice CRUD
/admin/facilities ........... Facility CRUD + blackouts
/admin/dues ................. Due generation + mark paid
/admin/tickets .............. All tickets + assignment
/admin/audit ................ Audit log viewer
/admin/export ............... Data export

/gate ....................... Security guard validation page (PWA, minimal)
/gate/validate .............. OTP/QR entry → validation result
```

### 10.4 Environment Variables Inventory

```bash
# ─── Core App ────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://portal.gulshandynasty.com
NEXTAUTH_SECRET=<random-32-char>
NEXTAUTH_URL=https://portal.gulshandynasty.com

# ─── Auth Providers ──────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=

# ─── Database ────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@localhost:5432/gulshan_dynasty

# ─── MinIO (S3-compatible) ───────────────────────────
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=community-files

# ─── Email ───────────────────────────────────────────
RESEND_API_KEY=

# ─── Bootstrap ───────────────────────────────────────
SETUP_SECRET=<one-time-setup-key>  # used only for initial admin creation

# ─── Optional ────────────────────────────────────────
CLOUDFLARE_R2_ENDPOINT=          # for off-site backups
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
```

### 10.5 Final Schema Corrections (Applied to Base)

These correct the base schema in §3.2 directly. When scaffolding, use these as the authoritative versions:

```prisma
// ─── CORRECTED: Vote model (C1) ────────────────────────────────
model Vote {
  id           String   @id @default(cuid())
  pollId       String
  optionId     String
  userId       String
  votedAt      DateTime @default(now())

  poll   Poll       @relation(fields: [pollId], references: [id])
  option PollOption @relation(fields: [optionId], references: [id])
  user   User       @relation(fields: [userId], references: [id])

  @@unique([pollId, optionId, userId]) // one vote per option per user
  @@index([pollId, userId])            // fast "user's votes in this poll" lookup
}

// ─── CORRECTED: FileEntry (G17 applied) ─────────────────────────
model FileEntry {
  id             String   @id @default(cuid())
  subCommunityId String?  // null = global society document
  name           String
  mimeType       String
  sizeBytes      Int
  storageKey     String
  uploadedById   String
  createdAt      DateTime @default(now())

  subCommunity SubCommunity? @relation(fields: [subCommunityId], references: [id])
}

// ─── CORRECTED: HelpTicket (G9 applied) ─────────────────────────
model HelpTicket {
  id                    String         @id @default(cuid())
  userId                String
  unitId                String?
  category              TicketCategory
  priority              TicketPriority @default(MEDIUM)
  subject               String
  description           String
  status                TicketStatus   @default(OPEN)
  assignedToUserId      String?
  assignedToCommunityId String?
  resolvedAt            DateTime?
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt

  user                User            @relation("TicketCreator", fields: [userId], references: [id])
  assignedToUser      User?           @relation("TicketAssignee", fields: [assignedToUserId], references: [id])
  assignedToCommunity SubCommunity?   @relation(fields: [assignedToCommunityId], references: [id])
  comments            TicketComment[]
  attachments         TicketAttachment[]

  @@index([status, createdAt])
  @@index([assignedToUserId])
}

// ─── CORRECTED: FacilityBooking (G5, G19, G26 applied) ──────────
model Facility {
  id               String   @id @default(cuid())
  name             String   @unique
  description      String?
  location         String?
  slotMinutes      Int      @default(60)
  maxAdvDays       Int      @default(7)
  capacity         Int      @default(1)
  maxBookingsPerUser Int    @default(2)
  minCancelMinutes Int      @default(60)
  requiresApproval Boolean  @default(false)
  createdAt        DateTime @default(now())

  bookings  FacilityBooking[]
  blackouts FacilityBlackout[]
}

model FacilityBooking {
  id         String        @id @default(cuid())
  facilityId String
  userId     String
  startsAt   DateTime
  endsAt     DateTime
  status     BookingStatus @default(CONFIRMED)
  createdAt  DateTime      @default(now())

  facility Facility @relation(fields: [facilityId], references: [id])
  user     User     @relation(fields: [userId], references: [id])

  @@index([facilityId, startsAt, endsAt])
  @@index([userId, startsAt])
}

// ─── CORRECTED: VisitorPass (G4, G28, G43 applied) ──────────────
model VisitorPass {
  id             String      @id @default(cuid())
  userId         String
  unitId         String
  visitorName    String
  visitorPhone   String?
  visitorType    VisitorType
  otp            String
  validFrom      DateTime
  validUntil     DateTime
  status         PassStatus  @default(ACTIVE)
  isRecurring    Boolean     @default(false)
  recurrenceDays String[]    // ["MON","TUE",...]
  parkingSlot    String?
  usedAt         DateTime?
  createdAt      DateTime    @default(now())

  user User @relation(fields: [userId], references: [id])
  unit Unit @relation(fields: [unitId], references: [id])

  @@index([unitId, status])
  @@index([otp, status])  // fast OTP lookup for guard validation
}

// ─── CORRECTED: User (G8, G15, G47, G56 applied) ────────────────
model User {
  id                    String          @id @default(cuid())
  name                  String
  email                 String          @unique
  phone                 String?
  avatarUrl             String?
  globalRole            GlobalRole      @default(RESIDENT)
  approvalStatus        ApprovalStatus  @default(PENDING)
  isActive              Boolean         @default(true)
  approvedBy            String?
  approvedAt            DateTime?
  termsAcceptedAt       DateTime?
  claimedUnitId         String?
  claimStatus           ClaimStatus?
  emergencyContactName  String?
  emergencyContactPhone String?
  vehiclePlates         String[]
  staffPin              String?         // hashed PIN for SECURITY_STAFF
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  // ... relations unchanged
}

// ─── CORRECTED: Poll (G7, G25, G53 applied) ─────────────────────
model Poll {
  id               String           @id @default(cuid())
  title            String
  description      String?
  scope            PollScope
  subCommunityId   String?
  isAnonymous      Boolean          @default(false)
  resultVisibility ResultVisibility  @default(LIVE)
  maxChoices       Int              @default(1)
  eligibility      PollEligibility  @default(ALL_RESIDENTS)
  isResolution     Boolean          @default(false)
  quorumPercentage Int?
  opensAt          DateTime
  closesAt         DateTime
  createdById      String
  createdAt        DateTime         @default(now())

  subCommunity SubCommunity? @relation(fields: [subCommunityId], references: [id])
  options      PollOption[]
  votes        Vote[]
}

// ─── CORRECTED: Unit (G43 applied) ──────────────────────────────
model Unit {
  id           String     @id @default(cuid())
  unitNumber   String     @unique
  block        String
  floor        Int?
  unitType     UnitType   @default(APARTMENT)
  areaSqFt     Float?     @default(2783)
  parkingSlots Int        @default(2)
  createdAt    DateTime   @default(now())

  memberships   UnitMembership[]
  dues          Due[]
  visitorPasses VisitorPass[]
}
```

### 10.6 Spec Maturity Assessment

After 5 passes (60+ gaps reviewed), the spec is now **implementation-ready**:

| Area | Status | Notes |
|---|---|---|
| Property context | ✅ Complete | 204 units, 3 towers, all details locked |
| Tech stack | ✅ Complete | All-free, self-hosted, no vendor lock-in |
| Schema | ✅ Complete | All patches consolidated into §10.5 corrections |
| Permission matrix | ✅ Complete | 7 roles × 22 actions explicitly defined |
| Route map | ✅ Complete | All pages and their access levels documented |
| Backlog | ✅ Complete | 16 epics, ~70 stories, prioritized |
| Sprint plan | ✅ Complete | Sprint 0–8, 17 weeks total |
| Hosting/deployment | ✅ Complete | $0/month architecture documented |
| Env vars | ✅ Complete | All required secrets inventoried |
| UX direction | ✅ Complete | Art Deco, color palette, image assets, landing page sections |
| Edge cases | ✅ Complete | 60+ gaps identified and resolved |
| Phase-2 deferrals | ✅ Documented | Clear boundary between v1 and future work |
| Testing strategy | ✅ Defined | Vitest + Playwright, focused on business logic |
| DR/Backup | ✅ Defined | Daily backups to R2, 2h RTO, 24h RPO |

**No further spec passes recommended.** Remaining unknowns are implementation-level decisions best resolved during coding (e.g., exact Tailwind color tokens, component folder structure, specific Prisma migration ordering).

---

*Document generated for Gulshan Dynasty Community Portal — v1.4 (final spec)*
