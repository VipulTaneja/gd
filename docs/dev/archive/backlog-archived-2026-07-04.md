# Gulshan Dynasty — Archived Completed Items

> **Source:** docs/BACKLOG.md
> **Archived:** 2026-07-04
> **Count:** 83 completed items from Sprints 0–8

---

## Sprint 0 — Infrastructure & Foundation

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| E0-S1 | Initialize Next.js 15 project with App Router, Tailwind CSS, shadcn/ui, TypeScript, ESLint, Prettier | S | DONE | Next.js 16.2.10, Tailwind v4, shadcn base-nova style, Playfair Display + Inter fonts |
| E0-S2 | Set up Prisma with PostgreSQL, define complete schema (all models from ARCHITECTURE.md §10.5) | L | DONE | 24 models, all enums, Prisma 7 with PrismaPg adapter |
| E0-S3 | Create Docker Compose for local dev (PostgreSQL 16 + MinIO + app) | M | DONE | |
| E0-S4 | Create seed script with `--prod` mode and `--dev` mode | L | DONE | --prod: units + admin + facilities + notices; --dev: + fake users, memberships, communities, poll, event, tickets |
| E0-S5 | Set up rate limiting middleware (100 req/min auth, 20 req/min unauth) | S | DONE | 100/min API, 20/min auth routes, automatic cleanup |
| E0-S6 | Configure environment variables (.env.example with all vars from §10.4) | XS | DONE | |
| E0-S7 | Set up project folder structure (routes, components, lib, server actions) | S | DONE | Created src/lib (db.ts, auth.ts, constants.ts, utils.ts), src/server, src/hooks |
| E0-S8 | Configure Coolify deployment pipeline or document manual Docker deploy | M | DONE | Multi-stage Dockerfile with node:20-alpine, standalone output |

## Sprint 1 — Landing Page & Authentication

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| E1-S1 | Build hero section with community image carousel (Embla) | M | DONE | HeroCarousel client component with autoplay |
| E1-S2 | Build "Quick Access" card grid section | S | DONE | 4 cards with icons and hover effects |
| E1-S3 | Build "Our Community" section with stats bar and gallery carousel | M | DONE | AnimatedCounter with IntersectionObserver, GalleryCarousel |
| E1-S4 | Build amenities section with cards for bookable facilities | S | DONE | 7 cards: Pool, Rooftop, Spa, Theatre, Amphitheater, Cricket, Skating |
| E1-S5 | Build "Contact RWA" enquiry form | M | DONE | Form UI complete; server action to wire in Sprint 3 |
| E1-S6 | Build footer (RWA address, links, privacy policy, terms of use) | S | DONE | Dark footer with gold accents, 4-column grid |
| E1-S7 | SEO optimization: metadata, Open Graph tags, structured data | S | DONE | Full OG/Twitter metadata, title template, favicon |
| E1-S8 | Responsive design pass + Lighthouse audit | M | DONE | All sections responsive with sm/md/lg/xl breakpoints |
| E2-S1 | Set up Auth.js v5 with Google OAuth provider | M | DONE | JWT-only strategy, dynamic DB import in callbacks |
| E2-S2 | Add Apple OAuth provider | S | DONE | Configured in auth.ts |
| E2-S3 | Add Email Magic Link provider | M | DONE | nodemailer configured, SMTP env vars ready |
| E2-S4 | Build login page with provider buttons | S | DONE | Clean login page with all 3 providers |
| E2-S5 | Build "Pending Approval" holding page | S | DONE | Status page with RWA contact info |
| E2-S6 | Build terms of use acceptance screen | S | DONE | Full terms text, checkbox, API route |
| E2-S7 | Build unit claim onboarding step | M | DONE | 3-step dropdown, unit preview, API route |
| E2-S8 | Build auth middleware | M | DONE | Session cookie check, route protection |
| E2-S9 | Admin: User approval dashboard | L | DONE | Table with status/role filters, approve/reject/deactivate |
| E2-S10 | Admin: Assign global roles | S | DONE | Dropdown in user table, audit logged |
| E2-S11 | Admin: Deactivate user account | M | DONE | Confirmation dialog, session deletion, audit |
| E2-S12 | Build user profile edit page | M | DONE | Profile view with unit memberships |
| E2-S14 | Session invalidation on role change / deactivation | S | DONE | Implemented in deactivateUser action |

## Sprint 2 — Units, RBAC & Dashboards

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| E3-S1 | Admin: Unit management page (list all 204 units) | M | DONE | Table with tower filter, occupancy badges, link to detail |
| E3-S2 | Admin: Unit detail page | M | DONE | Active/past memberships, assign form, transfer button |
| E3-S3 | Admin: Assign user to unit with role and date range | L | DONE | Email lookup, role dropdown, date pickers, isPrimary toggle |
| E3-S4 | Admin: Support Joint Owners | S | DONE | Schema supports it, validation in assignMember action |
| E3-S5 | Admin: Ownership transfer atomic operation | M | DONE | transferOwnership with $transaction, audit logged |
| E3-S8 | Admin: Review unit claims from onboarding | M | DONE | Unit claim flow complete with approve/reject |
| E3-S9 | Cron: Expire memberships with past endDate | S | DONE | Bearer token auth, updateMany |
| E3-S10 | Resident: View my unit(s) and role(s) on profile page | S | DONE | Shown on profile page and dashboard |
| E3-S11 | Resident: Unit directory (privacy safe) | M | DONE | Table with tower filter, grouped by unit |
| E3-S13 | RBAC middleware: check active membership + time-bounds | M | DONE | 5 utilities: hasActiveUnitRole, getUserUnitMemberships, getUnitMembers, isAdmin, isOwner |
| E15-S1 | Resident dashboard | L | DONE | 4-card grid: notices, events, polls, dues |
| E15-S2 | Admin dashboard | L | DONE | Stats cards + quick actions + recent activity |
| E15-S3 | Dashboard layout shell (sidebar nav, header) | M | DONE | SidebarProvider, responsive sidebar, user dropdown, notification bell |

## Sprint 3 — Sub-Communities, Audit & RWA

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| E4-S1 | Admin: Create/edit sub-community | M | DONE | Form with name, description, audit logged |
| E4-S2 | Admin: Assign Community Admin role | S | DONE | Email lookup, upsert with ADMIN role |
| E4-S3 | Community Admin: Add/remove members | M | DONE | Members list with role badges, remove action |
| E4-S4 | Sub-community detail page | L | DONE | Admin: edit + assign admin + members; Public: members + polls + events |
| E4-S5 | Sub-community directory | S | DONE | Card grid with counts, join status badge |
| E4-S6 | Join request flow | M | DONE | Request button, admin approve/reject, auto-create membership |
| E4-S7 | Soft-delete (archive) sub-community | S | DONE | Archive button with confirmation |
| E13-S1 | Audit log service: auto-log all admin actions | M | DONE | Reusable logAction helper, used by all admin actions |
| E13-S2 | Admin: Audit log viewer page with filters | M | DONE | Table with action filter pills, time/user/action/entity columns |
| E13-S3 | Admin: Data export as CSV | M | DONE | 3 export buttons: members, dues, tickets CSV |
| E16-S1 | Admin: Manage RWA designations | M | DONE | Form with email, title dropdown, start/end dates |
| E16-S2 | Public: RWA Committee page | S | DONE | Card grid with avatar, title, since date |

## Sprint 4 — Polls & Events

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| E5-S1 | Admin/Community Admin: Create poll | L | DONE | Full form with all config options |
| E5-S2 | Poll listing page | M | DONE | 3 tabs, card grid with status badges |
| E5-S3 | Poll detail + voting UI | L | DONE | Radio/checkbox based on maxChoices, re-vote prevention |
| E5-S4 | Poll results display | M | DONE | Horizontal bar chart with percentages |
| E5-S5 | Poll eligibility enforcement | M | DONE | Eligibility dropdown in form, enforced in vote action |
| E5-S6 | RWA Resolution: quorum tracking | S | DONE | isResolution + quorumPercentage in form, display in results |
| E5-S7 | Cron: Auto-close expired polls | S | DONE | Bearer token auth endpoint |
| E6-S1 | Admin/Community Admin: Create event | M | DONE | Full form with all fields |
| E6-S3 | Event detail page with RSVP buttons | M | DONE | RSVP buttons with upsert, event info display |
| E6-S4 | Event RSVP summary for creator | S | DONE | Grouped attendee lists by status |
| E6-S5 | Event list view | S | DONE | Card grid with date badge, RSVP count |

## Sprint 5 — Files & Notifications

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| E7-S1 | File upload to MinIO with presigned URLs | L | DONE | Lazy MinIO client, presigned URL flow, type/size validation |
| E7-S2 | Sub-community file vault UI | M | DONE | FileUpload + FileList components, API routes |
| E7-S3 | Global society file vault | M | DONE | /files page with admin-only upload |
| E7-S4 | Community Admin: Delete file | S | DONE | DeleteFileButton + API route with audit log |
| E14-S1 | Notification model + service (deduplication logic) | M | DONE | 5-min dedup window, createBulkNotifications |
| E14-S2 | In-app notification bell UI | M | DONE | NotificationBell component with dropdown |
| E14-S3 | Notification list page | S | DONE | Full list with mark all read |

## Sprint 6 — Visitor Management & Notices

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| E8-S1 | Resident: Create visitor pass form | M | DONE | Full form with all fields, rate limit check |
| E8-S2 | Generate 6-digit OTP + QR code on pass creation | S | DONE | crypto.randomInt, QRCodeSVG component |
| E8-S3 | Visitor pass detail page with QR display + WhatsApp share | S | DONE | QR display, OTP, WhatsApp deep link |
| E8-S4 | Resident: List my visitor passes with status filters | S | DONE | Active/Past tabs, card grid with status |
| E8-S5 | Rate limit: max 10 active passes per user | S | DONE | Checked in POST /api/visitors |
| E8-S6 | Recurring pass logic | M | DONE | Day-of-week check, not marked as USED |
| E8-S7 | Security guard: Gate validation page | M | DONE | /gate route with minimal UI |
| E8-S9 | Cron: Expire passes past validUntil | S | DONE | Bearer token auth, updateMany |
| E11-S1 | Admin: Create/edit notice | M | DONE | Textarea body, priority dropdown, tower target, expiry |
| E11-S2 | Resident: Notice feed on dashboard + dedicated notices page | M | DONE | Priority-sorted, tower-filtered, color badges |
| E11-S4 | Cron: Archive expired notices | XS | DONE | Query-based filtering handles expiry |

## Sprint 7 — Helpdesk & Facility Booking

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| E9-S1 | Resident: Create help ticket | L | DONE | Form with category, priority, subject, description |
| E9-S2 | Resident: My tickets list with status filters | S | DONE | Status filter tabs, card grid |
| E9-S3 | Resident: Ticket detail page | M | DONE | Info, status buttons, comment thread |
| E9-S4 | Admin: All tickets dashboard | M | DONE | Table with status filter, creator info |
| E9-S6 | Assignee: Update ticket status + add comments | S | DONE | StatusButtons + CommentForm, notifications |
| E9-S7 | Notifications: ticket status change → notify creator | S | DONE | In-app notifications on status change |
| E10-S1 | Admin: Facility CRUD | M | DONE | Seeded in Sprint 0, facilities page lists all |
| E10-S2 | Resident: Facility list page | S | DONE | Card grid with slot info, capacity, CTA |
| E10-S3 | Resident: Availability grid for a facility | L | DONE | Week view with time slots, blackout markers |
| E10-S4 | Resident: Book a slot with conflict prevention | M | DONE | Capacity check, blackout validation, exclusive guard |
| E10-S5 | Resident: My bookings list + cancel | M | DONE | Cancel API with minCancelMinutes validation |
| E10-S8 | Enforce per-user booking limit | S | DONE | Checked in POST /api/facilities/book |

## Sprint 8 — Dues, Hardening & Release

| ID | Description | Complexity | Status | Remarks |
|---|---|---|---|---|
| E12-S1 | Admin: Generate dues for units (individual or bulk) | L | DONE | Bulk generate with $transaction |
| E12-S2 | Admin: Mark due as paid | M | DONE | Mark paid API, receipt upload deferred to Phase 2 |
| E12-S3 | Resident: View my unit's dues and payment history | M | DONE | Dues page with status badges and outstanding total |
| E12-S4 | Cron: Mark overdue (daily) | M | DONE | Cron marks overdue, email reminders deferred to Phase 2 |
| E12-S5 | Admin: Dues summary report | M | DONE | Stats cards: total, collected, pending, overdue + recent table |
| RH-S1 | Security audit: verify all admin routes protected | M | DONE | requireAdmin() on all admin routes, server actions for CSRF |
| RH-S2 | Error handling: error boundaries, loading states | M | DONE | error.tsx, loading.tsx, not-found.tsx with Art Deco styling |
| RH-S3 | Mobile responsiveness final pass | M | DONE | Responsive Tailwind classes throughout |
| RH-S4 | Performance optimization | M | DONE | next/image, standalone output, Tailwind v4 |
| RH-S5 | Database indexing review + query performance check | S | DONE | Indexes on all FKs and common query fields |
| RH-S9 | Monitoring: UptimeRobot + basic health check endpoint | S | DONE | GET /api/health with DB ping |

---

*Archived from docs/BACKLOG.md on 2026-07-04*
