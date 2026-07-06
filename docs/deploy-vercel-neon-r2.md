# Deploy to Vercel + Neon + Cloudflare R2

Free-tier stack for the Gulshan Dynasty community portal.

| Service | Role | Free tier |
|---|---|---|
| [Vercel](https://vercel.com) | Next.js hosting, cron jobs | Hobby |
| [Neon](https://neon.tech) | PostgreSQL | 0.5 GB storage, compute limits |
| [Cloudflare R2](https://developers.cloudflare.com/r2/) | File uploads (S3-compatible) | 10 GB storage / month |
| [Resend](https://resend.com) | Magic-link email (optional) | 100 emails/day |
| [Google Cloud Console](https://console.cloud.google.com) | OAuth login | Free |

---

## 1. Neon (database)

1. Create a project at [console.neon.tech](https://console.neon.tech).
2. Copy the **pooled** connection string (important for serverless):
   ```
   postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
3. From your machine, run migrations against Neon:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```
4. Seed production data (optional):
   ```bash
   DATABASE_URL="postgresql://..." npm run db:seed:prod
   ```

---

## 2. Cloudflare R2 (file storage)

1. In [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2** → **Create bucket**
   - Name: `community-files` (or your choice)
2. **Manage R2 API tokens** → Create token with **Object Read & Write** on that bucket.
3. Note:
   - Account ID (from R2 overview URL)
   - Access Key ID
   - Secret Access Key
4. Endpoint format:
   ```
   https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   ```

The app uses the existing MinIO client pointed at R2 — no code changes needed beyond env vars.

---

## 3. Google OAuth (login)

1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Create **OAuth 2.0 Client ID** (Web application).
3. Authorized redirect URI:
   ```
   https://<your-vercel-domain>/api/auth/callback/google
   ```
4. Copy Client ID and Client Secret.

> Dev quick-login does **not** work in production. Residents must use Google (or email magic link).

---

## 4. Resend (email magic links, optional)

1. Sign up at [resend.com](https://resend.com).
2. Add and verify your sending domain (or use Resend's test domain for previews).
3. Create an API key → set `RESEND_API_KEY`.
4. Set `EMAIL_FROM` to a verified address, e.g. `noreply@yourdomain.com`.

---

## 5. Vercel (deploy)

### Connect repo

1. Push this repo to GitHub.
2. [vercel.com/new](https://vercel.com/new) → Import the repository.
3. Framework preset: **Next.js** (auto-detected).

### Environment variables

Set these in **Project → Settings → Environment Variables** (Production + Preview):

| Variable | Example / notes |
|---|---|
| `DATABASE_URL` | Neon **pooled** URL with `?sslmode=require` |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | Same as `AUTH_SECRET` (legacy alias) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Same as `NEXTAUTH_URL` |
| `GOOGLE_CLIENT_ID` | From Google Cloud |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud |
| `RESEND_API_KEY` | From Resend (optional) |
| `EMAIL_FROM` | Verified sender address |
| `CLOUDFLARE_R2_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `CLOUDFLARE_R2_ACCESS_KEY` | R2 access key |
| `CLOUDFLARE_R2_SECRET_KEY` | R2 secret key |
| `CLOUDFLARE_R2_BUCKET` | `community-files` |
| `CRON_SECRET` | Random string; Vercel sends this on cron requests |
| `SETUP_SECRET` | Bootstrap admin secret (one-time setup) |

### Deploy

Click **Deploy**. The build runs `prisma generate && next build`.

### Custom domain (optional)

Vercel → **Domains** → add your domain. Update:

- `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL`
- Google OAuth redirect URI

---

## 6. Cron jobs

`vercel.json` schedules background tasks. Vercel Hobby allows cron jobs; they call routes with `GET` and send `Authorization: Bearer <CRON_SECRET>`.

| Path | Schedule |
|---|---|
| `/api/cron/close-polls` | Every hour |
| `/api/cron/due-reminders` | Daily 06:00 UTC |
| `/api/cron/expire-memberships` | Daily 02:00 UTC |
| `/api/cron/expire-passes` | Every 15 minutes |

Set `CRON_SECRET` in Vercel env vars before crons run.

---

## 7. Post-deploy checklist

- [ ] `https://your-app.vercel.app/api/health` returns OK
- [ ] Google sign-in works end-to-end
- [ ] Upload a file (notices, tickets) — confirms R2 presigned URLs
- [ ] `/directory` loads when signed in
- [ ] Run bootstrap admin if needed (`SETUP_SECRET` flow)
- [ ] Approve first resident in `/admin/users`

---

## Local `.env` mapping for R2

You can test R2 locally without MinIO:

```env
CLOUDFLARE_R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY=...
CLOUDFLARE_R2_SECRET_KEY=...
CLOUDFLARE_R2_BUCKET=community-files
```

`MINIO_*` vars still work for local Docker Compose.

---

## Limits to know

- **Neon free**: DB sleeps when idle; first request may be slow (~1–2s cold start).
- **Vercel Hobby**: No team features; bandwidth/function limits apply.
- **R2 free**: 10 GB-month storage; egress to internet is billed (egress to Cloudflare is free).
- **Resend free**: 100 emails/day — enough for a small society.

For 200+ active residents with heavy file uploads, consider Neon paid tier or Oracle VM self-hosting.
