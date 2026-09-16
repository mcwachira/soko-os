# Soko-OS Database Schema Documentation

**Generated:** 2026-09-13  
**Database:** PostgreSQL 16  
**Laravel Version:** 13.x

---

## Overview

This document describes the complete database schema for Soko-OS, a modular monolith Laravel application for offline-first POS with multi-tenancy, tax compliance, accounting integration, and synchronization capabilities.

### Design Principles

1. **Multi-tenancy via Foreign Keys** - All tenant-scoped tables have `organization_id` FK with cascade delete
2. **Minor Units for Currency** - All monetary values stored as `bigInteger` (cents/kobo/centimes)
3. **UUID Primary Keys** - All tables use UUIDs for distributed/offline compatibility
4. **Soft Deletes** - Most entity tables use soft deletes for audit trail
5. **Ledger-based Inventory** - Inventory movements are immutable ledger entries with `balance_after`
6. **Optimistic Locking** - Products have `version` field for conflict detection

---

## Table Categories

### 1. Multi-Tenancy Hierarchy

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `organizations` | Top-level tenant | id, name, slug, tax_number, country_code, currency |
| `businesses` | Business units within org | id, organization_id, name, business_type, tax_pin, currency |
| `branches` | Physical locations | id, organization_id, business_id, name, code, address |
| `warehouses` | Stock locations | id, organization_id, business_id, branch_id, name, code |
| `terminals` | POS terminals | id, organization_id, business_id, branch_id, name, terminal_code |
| `devices` | Mobile/tablet devices | id, organization_id, business_id, branch_id, terminal_id, device_uuid, status |

### 2. Users & Authentication

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `users` | System users | id, organization_id, business_id, name, email, password, role, permissions |
| `personal_access_tokens` | Sanctum tokens | id, tokenable_id, name, token, abilities, last_used_at |

### 3. Product Catalog

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `categories` | Product categories (hierarchical) | id, organization_id, business_id, name, slug, parent_id |
| `products` | Product master data | id, organization_id, business_id, category_id, sku, barcode, name, cost_price_minor, selling_price_minor, version |

### 4. Inventory (Ledger-Based)

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `inventory_movements` | Immutable stock ledger | id, organization_id, business_id, branch_id, warehouse_id, product_id, movement_type, quantity_change, balance_after, reference_type, reference_id |

**Movement Types:** `purchase`, `sale`, `return`, `damage`, `transfer`, `adjustment`

### 5. Customers & Suppliers

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `customers` | Customer master data | id, organization_id, business_id, code, name, phone, email, tax_pin, credit_limit_minor, current_balance_minor, loyalty_points, price_level |

### 6. Cash Management

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `cash_shifts` | Cashier shifts | id, organization_id, business_id, branch_id, terminal_id, cashier_user_id, status, opened_at, closed_at, opening_float_minor, expected_cash_minor, actual_cash_minor, variance_minor, cash_sales_minor, cash_in_minor, cash_out_minor, cash_refunds_minor |

### 7. Sales

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `sales` | Sales transactions | id, organization_id, business_id, branch_id, terminal_id, cashier_user_id, shift_id, customer_id, receipt_number, invoice_number, status, subtotal_minor, discount_minor, tax_total_minor, grand_total_minor, paid_total_minor, change_due_minor, tax_submission_status, accounting_sync_status |
| `sale_items` | Sale line items | id, sale_id, product_id, sku, name, quantity, unit_price_minor, discount_minor, tax_rate_percentage, tax_amount_minor, subtotal_minor, total_minor |
| `payments` | Payment records | id, sale_id, amount_minor, currency, payment_method, status, reference, external_transaction_id, provider_response |

### 8. Returns & Refunds

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `returns` | Return transactions | id, organization_id, business_id, branch_id, terminal_id, sale_id, cashier_user_id, shift_id, return_number, status, return_type, subtotal_minor, tax_total_minor, grand_total_minor, refunded_total_minor, reason, notes, approved_by_user_id, approved_at |
| `return_items` | Return line items | id, return_id, sale_item_id, product_id, sku, name, quantity, unit_price_minor, discount_minor, tax_rate_percentage, tax_amount_minor, subtotal_minor, total_minor, return_reason, condition |
| `refunds` | Refund transactions | id, organization_id, business_id, branch_id, return_id, sale_id, payment_id, customer_id, refund_number, status, refund_method, amount_minor, currency, reference, external_transaction_id, provider_response, reason, processed_by_user_id, processed_at |
| `refund_items` | Refund line items | id, refund_id, return_item_id, sale_item_id, quantity, unit_price_minor, tax_amount_minor, total_minor |

### 9. Synchronization

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `sync_operations` | Offline sync log | id, organization_id, branch_id, device_id, idempotency_key, entity_name, action, local_id, payload, status, error_message |

**Status Values:** `accepted`, `rejected`, `conflict`

### 10. Tax & Fiscalization

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `tax_submissions` | KRA eTIMS submissions | id, organization_id, business_id, sale_id, country_code, tax_authority, status, control_code, qr_code_url, fiscal_signature, request_payload, response_payload, error_message |

**Status Values:** `pending`, `queued`, `submitting`, `accepted`, `rejected`, `failed`

### 11. Accounting (Double-Entry Ledger)

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `accounts` | Chart of accounts | id, organization_id, business_id, code, name, type, currency, is_active |
| `journal_entries` | Journal headers | id, organization_id, business_id, reference_type, reference_id, entry_date, notes |
| `journal_lines` | Journal lines | id, journal_entry_id, account_id, description, debit_minor, credit_minor |

**Account Types:** `asset`, `liability`, `equity`, `revenue`, `expense`

### 12. System Tables

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `outbox_events` | Event outbox for reliable delivery | id, organization_id, event_name, payload, status, retry_count, error_message |
| `audit_logs` | Comprehensive audit trail | id, organization_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent |
| `jobs` | Queue jobs | id, queue, payload, attempts, reserved_at, available_at, created_at |
| `failed_jobs` | Failed queue jobs | id, uuid, connection, queue, payload, exception, failed_at |

---

## Key Relationships

```
organizations (1) ──────< (N) businesses
businesses (1) ───────< (N) branches
branches (1) ─────────< (N) warehouses
branches (1) ─────────< (N) terminals
terminals (1) ────────< (N) devices
organizations (1) ────< (N) users
businesses (1) ───────< (N) users

branches (1) ─────────< (N) cash_shifts
terminals (1) ────────< (N) cash_shifts
users (1) ────────────< (N) cash_shifts (cashier)

sales (1) ────────────< (N) sale_items
sales (1) ────────────< (N) payments
returns (1) ──────────< (N) return_items
refunds (1) ──────────< (N) refund_items

products (1) ─────────< (N) inventory_movements
products (1) ─────────< (N) sale_items
products (1) ─────────< (N) return_items

journal_entries (1) ──< (N) journal_lines
accounts (1) ─────────< (N) journal_lines
```

---

## Indexes & Constraints

### Unique Constraints
- `organizations.slug` - Unique org slug
- `organizations.tax_number` - Unique tax number
- `businesses.organization_id, name` - Business name unique per org
- `branches.organization_id, code` - Branch code unique per org
- `terminals.organization_id, terminal_code` - Terminal code unique per org
- `devices.device_uuid` - Globally unique device ID
- `products.organization_id, sku` - SKU unique per org
- `products.organization_id, barcode` - Barcode unique per org (where present)
- `categories.organization_id, slug` - Category slug unique per org
- `sales.receipt_number` - Globally unique receipt number
- `returns.return_number` - Globally unique return number
- `refunds.refund_number` - Globally unique refund number
- `sync_operations.idempotency_key` - Idempotency key unique globally

### Foreign Keys (All Cascade Delete)
- All tenant-scoped tables → `organizations.id`
- Business-scoped tables → `businesses.id`
- Branch-scoped tables → `branches.id`
- Warehouse/terminal/device → respective parent tables

### Performance Indexes
- `inventory_movements(product_id, created_at)` - Stock queries
- `inventory_movements(organization_id, branch_id, product_id)` - Multi-tenant stock
- `sync_operations(device_id, created_at)` - Device sync history
- `sync_operations(idempotency_key)` - Idempotency lookups
- `sales(branch_id, created_at)` - Branch sales reports
- `sales(customer_id, created_at)` - Customer purchase history
- `cash_shifts(cashier_user_id, status)` - Active shift lookup
- `tax_submissions(sale_id)` - Tax submission per sale
- `audit_logs(entity_type, entity_id)` - Entity audit trail
- `outbox_events(status, created_at)` - Outbox processing

---

## Tenant Isolation Rules

### Query Scoping
All tenant-scoped queries MUST include:
```php
->where('organization_id', $user->organization_id)
```

### Middleware Enforcement
`EnsureTenantAccess` middleware validates:
1. User has `organization_id`
2. `branch_id` in request belongs to user's organization
3. `business_id` in request belongs to user's organization

### Policy Enforcement
Policies check `organization_id` match for cross-branch access

---

## Financial Integrity

### Minor Units
All monetary fields use `bigInteger` representing minor currency units (cents for KES):
- `1000` = 10.00 KES
- `1600` = 16.00 KES (VAT amount)

### Journal Entry Balance
Every `journal_entry` MUST balance:
```sql
SUM(journal_lines.debit_minor) = SUM(journal_lines.credit_minor)
```

### Inventory Ledger Consistency
For each product/warehouse:
```sql
balance_after = LAG(balance_after) OVER (PARTITION BY product_id, warehouse_id ORDER BY created_at) + quantity_change
```

---

## Soft Deletes
Tables with soft deletes retain data for audit:
- organizations, businesses, branches, warehouses, terminals, devices
- categories, products, customers
- cash_shifts, sales, returns, refunds
- accounts, journal_entries (no soft delete - immutable)

---

## Migration History

| Migration | Description |
|-----------|-------------|
| 0001_01_01_000000_create_users_table.php | Base users table |
| 0001_01_01_000001_create_cache_table.php | Cache table |
| 0001_01_01_000002_create_jobs_table.php | Queue jobs table |
| 2026_09_12_000001_create_soko_os_core_tables.php | Core schema (multi-tenancy, catalog, inventory, sales, sync, tax, accounting, system) |
| 2026_09_12_220145_create_personal_access_tokens_table.php | Sanctum tokens |
| 2026_09_13_072432_create_returns_and_refunds_tables.php | Returns & refunds tables |

---

## ERD Summary

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│organizations│ 1:N   │ businesses  │ 1:N   │  branches   │
└─────────────┘       └─────────────┘       └──────┬──────┘
                                                    │
                    ┌──────────────┬───────────────┼───────────────┐
                    │              │               │               │
              ┌─────▼─────┐  ┌─────▼─────┐   ┌─────▼─────┐   ┌────▼────┐
              │warehouses │  │terminals  │   │cash_shifts│   │  sales  │
              └───────────┘  └───────────┘   └───────────┘   └────┬────┘
                                                                   │
                    ┌──────────────┬───────────────┬───────────────┤
                    │              │               │               │
              ┌─────▼─────┐  ┌─────▼─────┐   ┌─────▼─────┐   ┌────▼────┐
              │sale_items │  │ payments  │   │  returns  │   │ refunds │
              └───────────┘  └───────────┘   └───────────┘   └─────────┘
                    │
              ┌─────▼─────┐
              │ inventory │
              │_movements │
              └───────────┘
```
