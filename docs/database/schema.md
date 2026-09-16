# Soko-OS Database Schema

Generated from migration files. All tables use UUID primary keys unless noted.

## Multi-Tenancy

| Table | Purpose |
|-------|---------|
| `organizations` | Top-level tenant |
| `businesses` | Business units under an organization |
| `branches` | Physical locations |
| `warehouses` | Inventory storage locations |
| `terminals` | POS terminals |
| `devices` | Mobile/tablet devices |

## Users & Access

| Table | Purpose |
|-------|---------|
| `users` | Authenticated users (extends Laravel default) |
| `personal_access_tokens` | Sanctum API tokens |
| `roles` | RBAC roles |
| `permissions` | RBAC permissions |
| `role_permission` | Role ↔ Permission pivot |

## Catalog

| Table | Purpose |
|-------|---------|
| `categories` | Product categories (hierarchical via `parent_id`) |
| `products` | Product master data with `version` for optimistic locking |

## Inventory

| Table | Purpose |
|-------|---------|
| `inventory_movements` | Ledger-based stock movements with `balance_after` |

## Customers

| Table | Purpose |
|-------|---------|
| `customers` | Customer master with credit balance and loyalty |

## Sales

| Table | Purpose |
|-------|---------|
| `sales` | Sale header |
| `sale_items` | Sale line items |
| `payments` | Payment records against a sale |

## Cash

| Table | Purpose |
|-------|---------|
| `cash_shifts` | Cashier shift sessions |

## Purchasing

| Table | Purpose |
|-------|---------|
| `suppliers` | Supplier master |
| `purchase_orders` | PO header |
| `purchase_order_items` | PO lines |
| `goods_received_notes` | GRN header |
| `goods_received_note_items` | GRN lines |

## Returns & Refunds

| Table | Purpose |
|-------|---------|
| `returns` | Return header |
| `return_items` | Return line items |
| `refunds` | Refund header |
| `refund_items` | Refund line items |

## Tax

| Table | Purpose |
|-------|---------|
| `tax_submissions` | KRA eTIMS submission records |

## Accounting

| Table | Purpose |
|-------|---------|
| `accounts` | Chart of accounts |
| `journal_entries` | Journal header |
| `journal_lines` | Journal debit/credit lines |

## System

| Table | Purpose |
|-------|---------|
| `sync_operations` | Offline sync queue with `idempotency_key` unique |
| `outbox_events` | Reliable event delivery |
| `audit_logs` | Model observer audit trail |
| `jobs` | Laravel queue jobs |
| `failed_jobs` | Failed queue jobs |
| `cache` | Cache store |
| `migrations` | Migration tracking |

## Key Design Decisions

- All monetary fields use `bigInteger` (minor units / cents)
- All tenant-scoped tables have `organization_id` FK
- `sales` → `sale_items` and `sales` → `payments` use cascade delete
- `products.version` enables optimistic locking for sync conflicts
- `sync_operations.idempotency_key` is globally unique
- `inventory_movements.balance_after` provides a point-in-time stock snapshot
