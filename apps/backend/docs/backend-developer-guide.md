# Soko-OS Backend Developer Guide

**Version:** 1.0  
**Date:** 2026-09-13  
**Target:** Fresh machine → production backend reproduction

---

## 01 — Prerequisites

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

## 02 — Existing Repository

```bash
pwd
git status
git remote -v
git branch --show-current
```

**Expected remote:** `https://github.com/mcwachira/soko-os.git`  
**Never:** `git init`, nested repos, deleting `.git`, creating a second GitHub repo for this work.

---

## 03 — Environment Configuration

```bash
cp .env.example .env
# Optional Docker-network reference values:
cp .env.docker.example .env.docker
```

Documented variables in `.env.example` include `APP_*`, `DB_*`, Redis/Mail/MinIO ports, and placeholder KRA/M-Pesa/accounting keys (empty or placeholder = not live).

---

## 04 — Docker Stack

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

### Destructive Reset

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

Optional local domain: add `127.0.0.1 soko-os.test` to `/etc/hosts`. HTTPS via mkcert is **Planned**.

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
| POST | `/api/v1/auth/login` | Public | Issue token |
| POST | `/api/v1/auth/logout` | Token | Revoke token |
| GET | `/api/v1/auth/me` | Token | Current user |
| POST | `/api/v1/sync/push` | Token + Tenant | Push offline ops |
| POST | `/api/v1/sync/pull` | Token + Tenant | Pull server changes |
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
| GET | `/api/v1/sync/conflicts` | Token + Tenant | List sync conflicts |
| POST | `/api/v1/sync/conflicts/{id}/resolve` | Token + Tenant | Resolve conflict |
| GET | `/api/v1/metrics` | Public | Metrics (JSON) |
| GET | `/api/v1/metrics/prometheus` | Public | Prometheus format |

All protected routes require `Authorization: Bearer <token>` header and enforce tenant isolation via `EnsureTenantAccess` middleware.

---

## 14 — Database Schema

Core migration: `2026_09_12_000001_create_soko_os_core_tables.php`

Key tables:

| Table Category | Tables |
|----------------|--------|
| Multi-tenancy | organizations, businesses, branches, warehouses, terminals, devices |
| Users | users, personal_access_tokens |
| Catalog | categories, products |
| Inventory | inventory_movements |
| Customers | customers |
| Cash | cash_shifts |
| Sales | sales, sale_items, payments |
| Sync | sync_operations |
| Tax | tax_submissions |
| Accounting | accounts, journal_entries, journal_lines |
| Returns | returns, return_items, refunds, refund_items |
| System | outbox_events, audit_logs, webhook_events |

All monetary fields use `bigInteger` (minor units/cents). All tables have `organization_id` FK for tenant isolation.

---

## 15 — Application Architecture

### Modular Monolith Structure

```
apps/backend/
├── app/
│   ├── Domain/              # Business domains
│   │   ├── Identity/        # Users, Roles, Permissions
│   │   ├── Tenancy/         # Organizations, Businesses, Branches
│   │   ├── Catalog/         # Products, Categories
│   │   ├── Inventory/       # Movements, Transfers
│   │   ├── Sales/           # Sales, Quotes, Orders
│   │   ├── Payments/        # Providers, Intents, Refunds
│   │   ├── Cash/            # Shifts, Floats
│   │   ├── Returns/         # Returns, Refunds
│   │   ├── Purchasing/      # Suppliers, POs, GRNs
│   │   ├── Tax/             # Calculation, KRA, Providers
│   │   ├── Accounting/      # Ledger, Journals, Providers
│   │   ├── Sync/            # Push, Pull, Conflicts
│   │   └── Reporting/       # Reports, Analytics
│   ├── Application/         # Use Cases, Actions, Commands
│   ├── Infrastructure/      # Repositories, Adapters, External APIs
│   ├── Http/                # Controllers, Requests, Resources
│   ├── Models/              # Eloquent Models
│   ├── Policies/            # Authorization Policies
│   ├── Services/            # Domain Services
│   ├── Jobs/                # Queue Jobs
│   ├── Events/              # Domain Events
│   ├── Listeners/           # Event Listeners
│   ├── Notifications/       # Notifications
│   ├── Providers/           # Service Providers
│   └── Console/             # Artisan Commands
├── config/                  # Configuration
├── database/                # Migrations, Factories, Seeders
├── routes/                  # Routes (api, console)
├── tests/                   # Tests (Unit, Feature)
└── storage/                 # Logs, Framework
```

### Layer Responsibilities

1. **Controllers** (Presentation) — HTTP handling, validation, response formatting
2. **Actions/Services** (Application) — Business logic, orchestration
3. **Domain Models** (Domain) — Business rules, invariants
4. **Repositories/Adapters** (Infrastructure) — Data access, external APIs

---

## 16 — Multi-Tenancy

Hierarchy:

```
Organization
  └── Business
        └── Branch
              ├── Warehouse
              ├── Terminal
              │     └── Device
              └── User
```

### Enforcement Layers

1. **Middleware** (`EnsureTenantAccess`) — Validates `organization_id`, `branch_id`, `business_id`
2. **Policies** — Check ownership on model operations
3. **Query Scopes** — `scopeForTenant($query, $organizationId)` on models
4. **Database FKs** — Cascade delete on `organization_id`
5. **Service Layer** — Explicit tenant checks in actions

### Testing Isolation

```bash
# Tenant A request → Tenant B resource → 403/404
curl -H "Authorization: Bearer <tenantA_token>" \
  http://localhost:8080/api/v1/sales/<tenantB_sale_id>
```

---

## 17 — Authentication & Authorization

### Authentication (Sanctum)

- Token-based API authentication
- Personal access tokens with 30-day expiry
- Login/Logout/Me endpoints

### Authorization

- **Roles:** `admin`, `supervisor`, `cashier`, `inventory_manager`, `accountant`, `auditor`
- **Permissions:** Array on User model (`['sales.create', 'products.update', ...]`)
- **Policies:** Per-model authorization (SalePolicy, ProductPolicy, etc.)
- **Gate::before** — Admin bypasses all checks

### Adding New Permissions

```php
// In seeder or user management
$user->update([
    'permissions' => [...$user->permissions, 'new.permission']
]);
```

---

## 18 — Domain Implementation Guides

### 18.1 Products & Catalog

**Models:** `Product`, `Category`  
**Controller:** `ProductController`, `CategoryController`  
**Key Features:** SKU/barcode, hierarchical categories, optimistic locking (`version`), search endpoint

**Create Product:**
```php
Product::create([
    'sku' => 'SKU-001',
    'name' => 'Product Name',
    'cost_price_minor' => 10000,    // 100.00
    'selling_price_minor' => 15000, // 150.00
    'tax_category_code' => 'B',     // 16% VAT
    'unit' => 'pcs',
    'track_inventory' => true,
    'version' => 1,
]);
```

### 18.2 Inventory (Ledger-Based)

**Model:** `InventoryMovement`  
**Movement Types:** `purchase`, `sale`, `return`, `damage`, `transfer`, `adjustment`

**Creating Movement (from Sale):**
```php
$quantityChange = -abs($item['quantity']); // Negative for sale
$balanceAfter = $this->getCurrentStock($productId, $warehouseId) + $quantityChange;

InventoryMovement::create([
    'movement_type' => 'sale',
    'quantity_change' => $quantityChange,
    'balance_after' => $balanceAfter,
    'reference_type' => 'sale',
    'reference_id' => $sale->id,
]);
```

**Current Stock Query:**
```php
$lastMovement = InventoryMovement::where('product_id', $productId)
    ->where('warehouse_id', $warehouseId)
    ->latest('created_at')
    ->first();
return $lastMovement?->balance_after ?? 0;
```

### 18.3 Sales

**Models:** `Sale`, `SaleItem`, `Payment`  
**Controller:** `SaleController`  
**Key Features:** Atomic creation, inventory decrement, cash shift update, customer balance, KRA queue, receipt generation

**Sale Creation Flow:**
```php
DB::transaction(function () use ($validated, $user) {
    // 1. Calculate totals
    // 2. Create Sale
    // 3. Create SaleItems
    // 4. Create InventoryMovements (stock decrement)
    // 5. Create Payments
    // 6. Update CashShift
    // 7. Update Customer Balance (credit)
    // 8. Queue KRA Fiscalization
});
```

### 18.4 Cash Shifts

**Model:** `CashShift`  
**Controller:** `ShiftController`  
**States:** `open`, `closed`

**Open Shift:**
```php
CashShift::create([
    'terminal_id' => $terminalId,
    'cashier_user_id' => $user->id,
    'opening_float_minor' => 50000, // 500.00
    'status' => 'open',
    'opened_at' => now(),
]);
```

**Close Shift:**
```php
$expectedCash = $shift->opening_float_minor + $shift->cash_sales_minor 
    + $shift->cash_in_minor - $shift->cash_out_minor - $shift->cash_refunds_minor;
$variance = $actualCash - $expectedCash;

$shift->update([
    'status' => 'closed',
    'actual_cash_minor' => $actualCash,
    'expected_cash_minor' => $expectedCash,
    'variance_minor' => $variance,
]);
```

### 18.5 Returns & Refunds

**Models:** `ReturnModel`, `ReturnItem`, `Refund`, `RefundItem`  
**Controller:** `ReturnController`, `RefundController`

**Return States:** `pending` → `approved` → `completed` / `cancelled` / `rejected`  
**Refund States:** `pending` → `processing` → `completed` / `failed` / `cancelled`

**Return Creation:**
```php
$return = ReturnModel::create([
    'sale_id' => $saleId,
    'return_type' => 'refund', // refund, exchange, store_credit
    'items' => [...], // validated against original sale items
]);
```

**Refund Processing:**
```php
$refund = Refund::create([
    'return_id' => $returnId,
    'sale_id' => $saleId,
    'refund_method' => 'cash', // cash, card, mpesa, store_credit, original
    'amount_minor' => $amount,
]);
```

### 18.6 Payments

**Models:** `Payment`  
**Service:** `PaymentProviderManager` with adapters

**Providers:**
- `CashPaymentProvider` — Immediate completion
- `CardPaymentProvider` — Terminal instructions
- `MpesaPaymentProvider` — Daraja STK Push
- `BankPaymentProvider` — Manual verification

**Payment Flow:**
```php
$intent = app(PaymentProviderManager::class)
    ->initiatePayment($sale, 'mpesa', [
        'amount_minor' => $sale->grand_total_minor,
        'phone_number' => '2547XXXXXXXX',
    ]);

// Callback handling
$result = app(PaymentProviderManager::class)
    ->handleCallback('mpesa', $callbackPayload);
```

### 18.7 Tax (KRA eTIMS)

**Service:** `KraEtimsService`  
**Job:** `FiscalizeSaleJob`  
**Model:** `TaxSubmission`

**Status Machine:** `pending` → `queued` → `submitting` → `accepted` / `rejected` / `failed`

**Payload Builder (OSCU-aligned):**
```php
$payload = [
    'tin' => config('tax.kra.pin'),
    'invcNo' => $sale->receipt_number,
    'salesTyCd' => 'N',
    'rcptTyCd' => 'S',
    'pmtTyCd' => '01',
    'itemList' => $sale->items->map(function ($item) { ... }),
    '_meta' => ['status' => 'Requires Credentials'],
];
```

**Note:** Live HTTP submission requires sandbox credentials + certification. Without credentials, submissions remain queued.

### 18.8 Accounting

**Models:** `Account`, `JournalEntry`, `JournalLine`  
**Service:** `AccountingService`  
**Providers:** `ZohoBooksAdapter`, `QuickBooksAdapter`, `XeroAdapter`

**Journal Generation (Sale):**
```php
// Debit: Cash/AR, COGS, Inventory
// Credit: Revenue, VAT, Discounts
// Validated: SUM(debits) == SUM(credits)
```

**Sync to Provider:**
```php
$service = new AccountingService(new ZohoBooksAdapter());
$service->createSaleInvoice($sale);
$service->createPaymentRecord($payment);
```

### 18.9 Synchronization

**Models:** `SyncOperation`  
**Controller:** `SyncController`

**Push (Device → Server):**
```json
POST /api/v1/sync/push
{
  "device_id": "device-uuid",
  "branch_id": "branch-uuid",
  "operations": [
    {
      "operation_id": "local-op-1",
      "entity_name": "sales",
      "action": "create",
      "local_id": "local-sale-1",
      "idempotency_key": "device-uuid:sales:local-sale-1:v1",
      "data": { ... }
    }
  ]
}
```

**Pull (Server → Device):**
```json
POST /api/v1/sync/pull
{
  "branch_id": "branch-uuid",
  "since_cursor": "1726123456",
  "limit": 500,
  "entities": ["products", "categories", "customers"]
}
```

**Conflict Resolution:**
```json
POST /api/v1/sync/conflicts/{syncOperationId}/resolve
{
  "resolution": "server_wins", // or "client_wins", "merge"
  "merged_data": { ... }
}
```

### 18.10 Outbox Pattern

**Model:** `OutboxEvent`  
**Service:** `OutboxService`  
**Job:** `ProcessOutboxEventsJob` (every minute)

**Recording Event:**
```php
OutboxService::record('sale.created', [
    'sale_id' => $sale->id,
], $organizationId);
```

**Processing:**
```php
$events = OutboxEvent::where('status', 'pending')
    ->where('retry_count', '<', 5)
    ->limit(100)
    ->get();

foreach ($events as $event) {
    dispatchEvent($event); // Routes to FiscalizeSaleJob, etc.
}
```

---

## 19 — Key Services Reference

| Service | Purpose | Location |
|---------|---------|----------|
| `PaymentProviderManager` | Unified payment interface | `app/Services/Payments/` |
| `AccountingService` | Journal generation, provider sync | `app/Services/Accounting/` |
| `OutboxService` | Reliable event delivery | `app/Services/OutboxService.php` |
| `KraEtimsService` | KRA eTIMS payload + submission | `app/Services/Tax/` |
| `ReceiptService` | HTML + ESC/POS receipts | `app/Services/ReceiptService.php` |
| `StructuredLogger` | JSON logging with correlation IDs | `app/Services/Logging/` |
| `AutoSyncJob` | Periodic sync for online devices | `app/Jobs/AutoSyncJob.php` |

---

## 20 — Queue Jobs

| Job | Queue | Retry | Purpose |
|-----|-------|-------|---------|
| `FiscalizeSaleJob` | high | 3 (1m, 5m, 15m) | KRA fiscalization |
| `ProcessOutboxEventsJob` | default | 1 | Outbox event delivery |
| `AutoSyncJob` | default | 3 (30s, 1m, 2m) | Device auto-sync |
| `GenerateReportJob` | low | 2 (5m, 10m) | Report generation |

---

## 21 — Scheduled Tasks

```php
// routes/console.php
Schedule::job(new ProcessOutboxEventsJob())->everyMinute();
Schedule::job(new AutoSyncJob($deviceId))->everyFiveMinutes();
Schedule::command('outbox:cleanup')->weekly();
```

---

## 22 — Observability

### Health Checks
- `GET /api/v1/health` — Overall system
- `GET /api/v1/health/database` — PostgreSQL
- `GET /api/v1/health/redis` — Redis

### Metrics (Prometheus)
- `GET /api/v1/metrics/prometheus` — Prometheus format
- Metrics: HTTP requests, queue depth, failed jobs, sync ops, tax submissions, payments, DB connections, Redis memory

### Structured Logging
- JSON format via `structured` channel
- Correlation IDs via `CorrelationIdMiddleware`
- Fields: timestamp, level, service, request_id, correlation_id, user_id, organization_id, event, message, context

### Audit Logging
- `AuditObserver` on all tenant models
- Captures: user, action, entity, old/new values, IP, UA

---

## 23 — Security

### Rate Limiting
- `api` limiter: 60/min per user/IP
- `login` limiter: 5/min per IP
- `sync` limiter: 30/min per user/IP

### CORS
- Configured in `config/cors.php`
- Allowed origins from `CORS_ALLOWED_ORIGINS`

### CSP/Headers
- `SecurityHeadersMiddleware` adds:
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin

### Mass Assignment Protection
- All models use `$fillable`
- Sensitive fields (`organization_id`, `approved_by`, `financial totals`) not fillable

---

## 24 — Testing

```bash
# Backend tests (runs in backend container)
pnpm test:backend

# Package tests (runs on host)
pnpm test:packages

# Frontend tests
pnpm test:frontend

# All tests
pnpm test
```

### Test Structure
```
tests/
├── Unit/           # Service, model tests
├── Feature/        # API endpoint tests
└── TestCase.php    # Base test case
```

### Critical Test Scenarios
1. **Sale Flow** — Create → Payment → Inventory → Cash → Tax → Accounting
2. **Offline Sync** — Push → Duplicate → Idempotency recognized
3. **Refund** — Sale → Partial refund → Payment refund → Inventory → Accounting → Tax
4. **Tenant Isolation** — Tenant A request → Tenant B resource → 403/404

---

## 25 — Adding New Features

### Adding a New Domain

1. Create domain folder: `app/Domain/NewDomain/`
2. Create models with tenant FKs
3. Create migration with `organization_id` FK
4. Create policy
5. Register policy in `AuthServiceProvider`
6. Create controller with tenant-scoped queries
7. Add routes with `tenant` middleware
8. Create factory/seeder
9. Write tests
10. Update OpenAPI spec

### Adding a New Payment Provider

1. Implement `PaymentProvider` interface
2. Create provider class in `app/Services/Payments/`
3. Register in `PaymentProviderManager` constructor
4. Add config in `config/payments.php`
5. Add env vars in `.env.example`

### Adding a New Accounting Provider

1. Implement `AccountingProvider` interface
2. Create adapter in `app/Services/Accounting/`
3. Add config in `config/accounting.php`
4. Add env vars in `.env.example`

### Adding a New Tax Provider (Country)

1. Create provider implementing `TaxProvider` interface
2. Add to `config/tax.php` providers array
3. Add country tax rules in `config/tax.php`
4. Create provider service class

---

## 26 — Deployment Checklist

### Pre-Deploy
- [ ] All tests pass
- [ ] Migrations tested on fresh DB
- [ ] Migrations tested on upgrade path
- [ ] Environment variables configured
- [ ] SSL certificates (production)
- [ ] Backup strategy verified

### Production Environment Variables
```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...
DB_HOST=...
DB_PASSWORD=...
REDIS_PASSWORD=...
MAIL_*=...
AWS_*=...
KRA_*=...           # Production credentials
MPESA_*=...         # Production credentials
ZOHO_*=...          # Production credentials
QUICKBOOKS_*=...
XERO_*=...
```

### Services to Run
- `php-fpm` (backend)
- `queue:work redis --queue=high,default,low`
- `schedule:run` (cron or supervisor)
- `nginx` (reverse proxy)

---

## 27 — Troubleshooting

| Issue | Solution |
|-------|----------|
| DB connection refused | Check `docker compose exec postgres pg_isready` |
| Redis connection refused | Check `docker compose exec redis redis-cli ping` |
| Queue not processing | Check `docker compose logs queue` |
| Sync conflicts | Check `SyncOperation` status, use resolve endpoint |
| KRA submissions stuck | Verify credentials, check `tax_submissions` table |
| Accounting sync fails | Check provider credentials, review outbox events |
| High memory | Check queue worker count, Redis memory |
| Slow queries | Enable `DB::listen`, check indexes |

---

## 28 — Backup & Recovery

### Database Backup
```bash
# Automated via cron
pg_dump -h localhost -U soko -d soko_os > backup_$(date +%F).sql
```

### Volume Backup
```bash
docker compose exec postgres pg_dump -U soko soko_os | gzip > backup.sql.gz
```

### Recovery
```bash
gunzip -c backup.sql.gz | docker compose exec -T postgres psql -U soko -d soko_os
```

---

## 29 — Performance Tuning

### Database
- Indexes on all FKs, `idempotency_key`, `device_id`, `created_at`
- Consider partitioning `inventory_movements`, `audit_logs` by month
- Use `pg_stat_statements` for slow query analysis

### Queue
- Scale workers per queue: `high` (2), `default` (3), `low` (1)
- Monitor `queue_jobs_pending` metric

### Caching
- Cache M-Pesa access tokens (55 min)
- Cache accounting provider tokens
- Use Redis for session/cache

---

## 30 — Appendix: Quick Reference Commands

```bash
# Full stack
pnpm dev:up

# Logs
pnpm dev:logs

# Migrations
pnpm db:migrate
pnpm db:reset

# Backend shell
docker compose exec backend bash

# Artisan
docker compose exec backend php artisan <command>

# Tests
pnpm test:backend

# Status
pnpm dev:ps

# Destroy (DANGEROUS)
pnpm dev:reset
```

---

## 31 — Clean Room Verification

To verify this guide works from scratch:

```bash
# 1. Fresh machine
# 2. Install prerequisites (Docker, pnpm, git)
# 3. Clone repo
git clone https://github.com/mcwachira/soko-os.git
cd soko-os

# 4. Configure
cp apps/backend/.env.example apps/backend/.env
# Edit .env with production values

# 5. Start infrastructure
pnpm dev:up

# 6. Migrate & seed
pnpm db:migrate

# 7. Start workers
# (queue and scheduler run automatically in Docker)

# 8. Test
curl http://localhost:8080/api/v1/health
pnpm test:backend

# 9. Verify API
# Login, create org, business, branch, product, customer, sale, payment, etc.
```

If any step fails, this guide is incomplete — update the relevant section.

---

*End of Backend Developer Guide*

*Last updated: 2026-09-13*
