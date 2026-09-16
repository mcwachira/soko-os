# ADR-004: Inventory Ledger Architecture

**Date:** 2026-09-13  
**Status:** Accepted

## Context

Inventory tracking must be auditable, support offline sync, and handle concurrent sales without overselling.

## Decision

**Immutable Ledger with Balance After** - Every stock change creates an `inventory_movements` record with running balance.

### Schema
```sql
inventory_movements (
    id UUID PK,
    organization_id, business_id, branch_id, warehouse_id FK,
    product_id FK,
    movement_type VARCHAR,        -- purchase, sale, return, damage, transfer, adjustment
    quantity_change DECIMAL(12,4), -- + for in, - for out
    balance_after DECIMAL(12,4),  -- running balance AFTER this movement
    reference_type VARCHAR,       -- sale, purchase, return, transfer, adjustment
    reference_id UUID,            -- FK to source document
    created_by_user_id FK
)
```

### Write Path
```php
// In transaction:
$lastMovement = InventoryMovement::where("product_id", $id)
    ->where("warehouse_id", $warehouseId)
    ->latest("created_at")
    ->first();

$balanceAfter = ($lastMovement?->balance_after ?? 0) + $quantityChange;

InventoryMovement::create([
    "quantity_change" => $quantityChange,
    "balance_after" => $balanceAfter,
    // ...
]);
```

### Read Path (Current Stock)
```php
$currentStock = InventoryMovement::where("product_id", $id)
    ->where("warehouse_id", $warehouseId)
    ->latest("created_at")
    ->value("balance_after") ?? 0;
```

## Consequences

### Positive
- **Full Audit Trail** - Every stock change explainable
- **Offline Sync Friendly** - Movements are immutable events
- **Concurrency Safe** - Balance calculated from ledger, not mutable column
- **Reconciliation** - Can rebuild state from genesis
- **Temporal Queries** - Stock at any point in time

### Negative
- **Write Amplification** - Every sale = 1+ movement records
- **Read Latency** - Need index scan for current stock
- **Storage Growth** - Movements table grows unbounded

## Optimizations

1. **Balance Cache Table** (future)
   ```sql
   CREATE TABLE inventory_balances (
       product_id, warehouse_id, quantity, version, updated_at
   );
   ```
   Updated via trigger or application event.

2. **Partitioning** - `inventory_movements` by `created_at` monthly

3. **Indexes**
   ```sql
   CREATE INDEX idx_inv_mov_product_warehouse_created 
   ON inventory_movements (product_id, warehouse_id, created_at DESC);
   ```

## Concurrency Control

- **Row-Level Lock** on product/warehouse during movement creation
- **Optimistic Locking** on `products.version` for price updates
- **Application-Level Reservation** (future) for pending orders

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Mutable `quantity` on Product | No audit trail, race conditions, offline sync conflict |
| Event Sourcing (separate) | Overkill, ledger IS event store |
| Periodic Snapshots | Complexity, stale reads between snapshots |
