# Soko-OS Developer Guide

Complete local build book for the **existing** repository. Commands below are verified against the Docker-first stack unless marked otherwise.

Companion docs: [Handbook](./SOKO-OS-DEVELOPER-HANDBOOK.md) · [Status](./implementation-status.md) · [Troubleshooting](./troubleshooting.md)

---

## 01 — Prerequisites

**Purpose:** Confirm host tooling.

```bash
node --version      # expect v22+
pnpm --version      # expect 11+
docker --version
docker compose version
git --version
php --version       # optional on host; Docker provides PHP 8.4
composer --version  # optional on host
uname -a
```

**Expected:** Docker Engine + Compose available. Do **not** require host PostgreSQL, Redis, Nginx, Mail, or MinIO.

---

## 02 — Existing repository

**Purpose:** Confirm you are in the authoritative clone.

```bash
pwd
git status
git remote -v
git branch --show-current
```

**Expected remote:** `https://github.com/mcwachira/soko-os.git`  
**Never:** `git init`, nested repos, deleting `.git`, creating a second GitHub repo for this work.

---

## 03 — Environment configuration

```bash
cp .env.example .env
# Optional Docker-network reference values:
cp .env.docker.example .env.docker
```

Documented variables in `.env.example` include `APP_*`, `DB_*`, Redis/Mail/MinIO ports, and placeholder KRA/M-Pesa/accounting keys (empty or placeholder = not live).

---

## 04 — Docker stack

```bash
pnpm install
pnpm dev:up          # docker compose up -d --build
pnpm dev:ps
pnpm dev:logs        # Ctrl+C to detach from follow
```

**Services:**

| Service | Role |
|---------|------|
| `nginx` | Reverse proxy → Next.js + Laravel |
| `web` | Next.js 15 (hot reload) |
| `backend` | PHP-FPM + Laravel 13 |
| `queue` | `php artisan queue:work redis` |
| `scheduler` | `schedule:run` loop |
| `postgres` | Primary DB + `soko_os_test` |
| `redis` | Cache / queue / sessions |
| `mailpit` | Local SMTP + UI |
| `minio` + `minio-init` | S3-compatible storage + bucket |

**Health:** Compose uses healthchecks on postgres, redis, backend (extensions), minio, nginx (API health).

### Destructive reset

```bash
pnpm dev:reset       # docker compose down -v  — DESTRUCTIVE: removes volumes
pnpm dev:up
pnpm db:migrate
```

---

## 05 — Nginx

Config: `infrastructure/nginx/default.conf`

- `/` → `web:3000` (Next.js, websocket upgrade for HMR)
- `/api/` → PHP-FPM `backend:9000` via FastCGI
- `/up` → Laravel framework health

Optional local domain: add `127.0.0.1 soko-os.test` to `/etc/hosts`. HTTPS via mkcert is **Planned** (see chapter 05b).

### 05b — Local HTTPS (Planned / documented approach)

1. Install [mkcert](https://github.com/FiloSottile/mkcert) and run `mkcert -install`
2. `mkcert soko-os.test localhost 127.0.0.1`
3. Mount certs into Nginx and listen on 443
4. To disable HTTPS: use HTTP on port 8080 (current default)

---

## 06 — PHP-FPM / Laravel

Image: `infrastructure/docker/php/Dockerfile` (PHP 8.4 FPM Alpine + pgsql + redis).

```bash
docker compose exec backend php -v
docker compose exec backend php artisan --version
docker compose exec backend php artisan about
```

---

## 07 — PostgreSQL

```bash
docker compose exec postgres pg_isready -U soko -d soko_os
pnpm db:migrate
```

Host connection (from laptop tools): `127.0.0.1:5437`, db `soko_os`, user `soko`, password `sokosecret` (dev only).

Test DB created on first volume init: `soko_os_test` (`infrastructure/postgres/init.sql`).

---

## 08 — Redis

```bash
docker compose exec redis redis-cli ping
# expect PONG
```

Used for cache, queues, sessions inside containers.

---

## 09 — Mailpit

- SMTP (Docker network): `mailpit:1025`
- Host SMTP: `127.0.0.1:1026`
- UI: http://localhost:8026

Laravel mailer in Compose: `MAIL_MAILER=smtp`, host `mailpit`.

---

## 10 — MinIO

- API: http://localhost:9002
- Console: http://localhost:9003
- Default bucket: `soko-storage` (created by `minio-init`)
- Credentials: see `.env.example` (`sokominio` / `sokominiosecret` for local only)

Laravel uses `FILESYSTEM_DISK=s3` with MinIO S3-compatible API.

---

## 11 — Turborepo / pnpm

```bash
pnpm install
pnpm build          # when package build scripts exist
pnpm typecheck
pnpm test:packages
pnpm test:frontend
```

Workspace: `apps/*`, `packages/*`.

---

## 12 — Next.js 15

App: `apps/web` (`@soko/web`).

```bash
# Via Docker (recommended through Nginx)
open http://localhost:8080

# Host-only frontend (API still via Docker)
pnpm --filter @soko/web dev
```

POS UI: neobrutalism-inspired checkout (search + cart). Offline writes use Dexie (`@soko/offline`).

**Frontend Foundation:**
- Next.js 15.5.25 + React 19
- Tailwind CSS v4.3.3 (CSS-first config, no `tailwind.config.js`)
- shadcn/ui (New York style, CSS variables)
- Theme: light/dark/system with persistence
- Canonical App Router: `apps/web/src/app/`
- Component showcase: `/dev/components`
- Build: `pnpm build` (Turborepo)
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`

**Note:** `node_modules/.pnpm` must be writable by the current user. If you see `EACCES` errors, run `sudo chown -R $USER:$USER node_modules/.pnpm`.

### Frontend structure

```
apps/web/src/
├── app/                  # App Router
├── components/
│   ├── ui/               # shadcn components
│   ├── marketing/        # Marketing nav, footer, forms
│   ├── shared/           # Loading, empty, error, theme-toggle
│   ├── pos/              # POS components (future)
│   ├── commerce/         # Commerce components (future)
│   ├── books/            # Books components (future)
│   ├── insights/         # Insights components (future)
│   └── settings/         # Settings components (future)
├── hooks/                # useAuth, useTanStackQuery, useSync, use-mobile
├── lib/                  # utils.ts, api.ts, query-keys.ts
├── providers/            # ThemeProvider
└── config/               # Static content/config

Shared code lives in workspace packages (@soko/*), not in src/.
```

---

## 13 — Laravel 13

App: `apps/backend`.

```bash
pnpm db:migrate
pnpm test:backend
curl -s http://localhost:8080/api/v1/health | jq
```

API prefix: `/api/v1`.

### 13b — Authentication (Sanctum)

```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get current user
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/auth/me

# Logout
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/auth/logout
```

Test credentials: `test@example.com` / `password` (seeded via `DatabaseSeeder`).

### 13c — API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/health` | Public | System health |
| GET | `/api/v1/health/database` | Public | DB health |
| GET | `/api/v1/health/redis` | Public | Redis health |
| GET | `/api/v1/metrics` | Public | Metrics (JSON) |
| GET | `/api/v1/metrics/prometheus` | Public | Prometheus format |
| POST | `/api/v1/auth/login` | Public | Issue token |
| POST | `/api/v1/auth/logout` | Token | Revoke token |
| GET | `/api/v1/auth/me` | Token | Current user |
| POST | `/api/v1/sync/push` | Token + Tenant | Push offline ops |
| POST | `/api/v1/sync/pull` | Token + Tenant | Pull server changes |
| GET | `/api/v1/sync/conflicts` | Token + Tenant | List sync conflicts |
| POST | `/api/v1/sync/conflicts/{id}/resolve` | Token + Tenant | Resolve conflict |
| GET | `/api/v1/sales` | Token + Tenant | List sales (paginated) |
| GET | `/api/v1/sales/{id}` | Token + Tenant | Get sale with items/payments |
| POST | `/api/v1/sales` | Token + Tenant | Create sale |
| GET | `/api/v1/sales/{id}/receipt` | Token + Tenant | Generate receipt |
| GET | `/api/v1/products` | Token + Tenant | List products |
| GET | `/api/v1/products/search` | Token + Tenant | Search products |
| GET | `/api/v1/products/{id}` | Token + Tenant | Get product |
| POST | `/api/v1/products` | Token + Tenant | Create product |
| PUT | `/api/v1/products/{id}` | Token + Tenant | Update product |
| DELETE | `/api/v1/products/{id}` | Token + Tenant | Delete product |
| GET | `/api/v1/categories` | Token + Tenant | List categories |
| GET | `/api/v1/categories/{id}` | Token + Tenant | Get category |
| POST | `/api/v1/categories` | Token + Tenant | Create category |
| PUT | `/api/v1/categories/{id}` | Token + Tenant | Update category |
| DELETE | `/api/v1/categories/{id}` | Token + Tenant | Delete category |
| GET | `/api/v1/shifts/current` | Token + Tenant | Get current shift |
| POST | `/api/v1/shifts/open` | Token + Tenant | Open cash shift |
| POST | `/api/v1/shifts/close` | Token + Tenant | Close cash shift |
| GET | `/api/v1/returns` | Token + Tenant | List returns |
| GET | `/api/v1/returns/{id}` | Token + Tenant | Get return |
| POST | `/api/v1/returns` | Token + Tenant | Create return |
| PUT | `/api/v1/returns/{id}` | Token + Tenant | Update return |
| DELETE | `/api/v1/returns/{id}` | Token + Tenant | Cancel return |
| GET | `/api/v1/refunds` | Token + Tenant | List refunds |
| GET | `/api/v1/refunds/{id}` | Token + Tenant | Get refund |
| POST | `/api/v1/refunds` | Token + Tenant | Create refund |
| POST | `/api/v1/refunds/{id}/complete` | Token + Tenant | Complete refund |

All protected routes require `Authorization: Bearer <token>` header and enforce tenant isolation via `EnsureTenantAccess` middleware.

---

## 14 — Database Schema

Core migration: `2026_09_12_000001_create_soko_os_core_tables.php`

Key tables:
- **Multi-tenancy**: organizations, businesses, branches, warehouses, terminals, devices
- **Users**: users (with organization_id, business_id FKs)
- **Catalog**: categories, products (with version for optimistic locking)
- **Inventory**: inventory_movements (ledger with balance_after)
- **Sales**: sales, sale_items, payments
- **Cash**: cash_shifts
- **Sync**: sync_operations (idempotency_key unique)
- **Tax**: tax_submissions (KRA eTIMS)
- **Accounting**: accounts, journal_entries, journal_lines
- **Returns**: returns, return_items, refunds, refund_items
- **System**: outbox_events, audit_logs, webhook_events

All monetary fields use `bigInteger` (minor units/cents). All tables have `organization_id` FK for tenant isolation.

---

## 15 — Testing

```bash
# Backend tests (runs in backend container)
pnpm test:backend

# Package tests (runs on host - requires fixed node_modules permissions)
pnpm test:packages

# Frontend tests
pnpm test:frontend

# All tests
pnpm test
```

E2E (Playwright): **Planned** (`pnpm test:e2e` currently prints a placeholder).

---

## 16 — System architecture

Modular monolith: Next.js clients + Laravel API + Postgres. Future modules (Inventory, Pay, Tax, Books, …) share the same platform, not separate repos.

See ADRs under `docs/adr/` (expanding).

---

## 17 — Offline / sync (current status)

| Piece | Status |
|-------|--------|
| Dexie schema (`@soko/offline`) | Implemented (schema + writes) |
| Sync package (`@soko/sync`) | Partial (engine + backoff) |
| `POST /api/v1/sync/push` | Implemented (multi-entity, idempotency) |
| `POST /api/v1/sync/pull` | Implemented (cursor-based delta) |
| Idempotency uniqueness | Implemented (DB unique on `idempotency_key`) |
| Conflict resolution | **Implemented** (server_wins, client_wins, merge) |
| Auto-sync on online | **Implemented** (5-min scheduler) |
| Conflict resolution API | **Implemented** (`GET/POST /api/v1/sync/conflicts`) |

---

## 18 — Tax / Kenya eTIMS (current status)

`App\Services\Tax\KraEtimsService` queues submissions via async job (`FiscalizeSaleJob`). It does **not** fake KRA acceptance. Live submission: **Requires Credentials / Sandbox / Certification**.

Payload builder produces OSCU-aligned structure with `_meta` disclaimer.

---

## 19 — Verification checklist (Milestone 1)

```text
[ ] Existing Git repository preserved
[ ] Git remote preserved
[ ] pnpm install works
[ ] docker compose up healthy
[ ] Nginx serves frontend (http://localhost:8080)
[ ] Nginx serves /api/v1/health (200 OK)
[ ] PostgreSQL healthy (pg_isready)
[ ] Redis healthy (PONG)
[ ] Queue container running
[ ] Scheduler container running
[ ] Mailpit UI opens (http://localhost:8026)
[ ] MinIO console opens (http://localhost:9003)
[ ] pnpm db:migrate succeeds
[ ] Auth login works (POST /api/v1/auth/login)
[ ] Protected API requires token (401 without)
[ ] Tenant isolation enforced (403 cross-org)
[ ] Sale creation works (POST /api/v1/sales)
[ ] Inventory movement created on sale
[ ] Cash shift totals update on sale
```

---

## 20 — Verification checklist (Milestone 2 - Completed)

```text
[x] Product catalog API (GET /api/v1/products)
[x] Sync pull returns delta (cursor-based)
[x] Sync push handles all entities (customers, inventory, shifts, returns, refunds)
[x] Frontend loads products from API
[x] Auto-sync on online event (5-min scheduler)
[x] Conflict detection in sync (optimistic locking on products)
[x] Conflict resolution API (GET/POST /api/v1/sync/conflicts)
[x] Receipt printing (ESC/POS + HTML)
[x] M-Pesa STK integration (Daraja scaffold, requires credentials)
[x] RBAC policies for all resources (Sale, Product, Customer, Category, CashShift, InventoryMovement, Return, Refund)
[x] Outbox pattern for async events (sale.created, payment.completed, etc.)
[x] Returns/Refunds domain (full CRUD + workflow)
[x] Payment providers (Cash, Card, M-Pesa, Bank adapters)
[x] Accounting integration (Zoho, QuickBooks, Xero adapters)
[x] Structured logging with correlation IDs
[x] Prometheus metrics endpoint
[x] Audit logging (model observers)
[x] Security (Rate limiting, CORS, CSP headers)
[x] OpenAPI specification
[x] E2E tests with Playwright (Planned)
```
```

---

## 21 — Common Commands Reference

```bash
# Start full stack
pnpm dev:up

# View logs
pnpm dev:logs

# Run migrations
pnpm db:migrate

# Fresh migrate + seed
pnpm db:reset

# Backend shell
docker compose exec backend bash

# Run artisan command
docker compose exec backend php artisan <command>

# Run tests
pnpm test:backend

# Check service status
pnpm dev:ps

# Destroy everything (DANGEROUS)
pnpm dev:reset
```

---

*Last updated: 2026-09-13*