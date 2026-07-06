#!/usr/bin/env bash
set -euo pipefail

# ─── Colors ──────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}▸${NC} $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC} $1"; }
fail()  { echo -e "${RED}✗${NC} $1"; exit 1; }

# ─── Kill process on a port if busy ──────────────────
free_port() {
  local port=$1
  local pid
  pid=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    warn "Port $port is in use (PID $pid) — killing it..."
    kill -9 $pid 2>/dev/null || true
    sleep 1
    ok "Port $port freed"
  fi
}

# ─── Checks ─────────────────────────────────────────
command -v node >/dev/null 2>&1   || fail "Node.js not found. Install v20+"
command -v docker >/dev/null 2>&1 || fail "Docker not found. Install Docker & Docker Compose"
command -v npm >/dev/null 2>&1    || fail "npm not found"

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
[ "$NODE_VERSION" -ge 20 ] || fail "Node.js v20+ required (found v$NODE_VERSION)"

# ─── .env setup ─────────────────────────────────────
if [ ! -f .env.local ]; then
  info "Creating .env.local from .env.example..."
  cp .env.example .env.local
  SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
  sed -i "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$SECRET|" .env.local
  sed -i "s|^SETUP_SECRET=.*|SETUP_SECRET=$(openssl rand -base64 16 2>/dev/null || head -c 16 /dev/urandom | base64)|" .env.local
  ok ".env.local created with generated secrets"
else
  ok ".env.local already exists"
fi

# ─── Free required ports ────────────────────────────
info "Checking required ports..."
free_port 5434
free_port 9010
free_port 9011
free_port 3000

# ─── Docker ─────────────────────────────────────────
info "Starting Postgres & MinIO..."
docker compose up -d
info "Waiting for Postgres to be ready..."
for i in $(seq 1 30); do
  docker compose exec -T postgres pg_isready -U gulshan -q 2>/dev/null && break
  sleep 1
done
docker compose exec -T postgres pg_isready -U gulshan -q 2>/dev/null || fail "Postgres did not start in time"
ok "Postgres is ready"

# ─── Install & Generate ─────────────────────────────
if [ ! -d node_modules ]; then
  info "Installing dependencies..."
  npm install
  ok "Dependencies installed"
else
  ok "node_modules exists"
fi

info "Generating Prisma client..."
npx prisma generate
ok "Prisma client generated"

# ─── Migrations ─────────────────────────────────────
info "Running database migrations..."
npx prisma migrate dev --name init
ok "Migrations applied"

# ─── Seed ────────────────────────────────────────────
info "Seeding database..."
export $(grep -v '^#' .env.local | xargs)
npx tsx prisma/seed.ts --dev
ok "Database seeded"

# ─── Start ──────────────────────────────────────────
echo ""
ok "Setup complete! Starting dev server..."
echo ""
npm run dev
