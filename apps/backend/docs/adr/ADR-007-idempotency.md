# ADR-007: Idempotency Strategy

**Date:** 2026-09-13  
**Status:** Accepted

## Context

Network failures, retries, and duplicate requests must not cause duplicate financial records.

## Decision

**Idempotency Keys at Multiple Layers**

### Layer 1: Sync Operations
- **Key Format:** `device_uuid:entity:local_id:version`
- **Storage:** `sync_operations.idempotency_key` (UNIQUE)
- **Behavior:** Return existing server ID on duplicate

### Layer 2: Payment Intents
- **Key Format:** `payment:sale_id:method:amount:client_nonce`
- **Storage:** `payments.idempotency_key` (UNIQUE, nullable)
- **Behavior:** Return existing payment on duplicate

### Layer 3: Tax Submissions
- **Key Format:** `tax:sale_id:attempt`
- **Storage:** `tax_submissions.idempotency_key` (UNIQUE, nullable)
- **Behavior:** Skip if sale already submitted

### Layer 4: Accounting Sync
- **Key Format:** `accounting:journal_entry_id:provider`
- **Storage:** `outbox_events.idempotency_key` (UNIQUE, nullable)
- **Behavior:** Skip if already sent to provider

## Implementation

### Request Pattern
```php
// Client generates UUID v4 per operation
$idempotencyKey = "device-123:sales:local-456:v1";

// Server checks
$existing = SyncOperation::where("idempotency_key", $key)->first();
if ($existing) {
    return response()->json([
        "accepted" => [["operation_id" => $opId, "server_id" => $existing->id]]
    ]);
}
```

### Database Constraints
```sql
-- Sync operations
ALTER TABLE sync_operations ADD CONSTRAINT uq_idempotency_key 
UNIQUE (idempotency_key);

-- Payments (partial index for non-null)
CREATE UNIQUE INDEX uq_payment_idempotency 
ON payments (idempotency_key) WHERE idempotency_key IS NOT NULL;
```

### Response Headers
```http
Idempotency-Key: device-123:sales:local-456:v1
X-Idempotency-Replay: true  # Indicates duplicate request
```

## Scenarios Handled

| Scenario | Protection |
|----------|------------|
| Client retry (timeout) | Same idempotency key returns existing |
| Webhook double delivery | Provider webhook ID as idempotency key |
| User double-click | Frontend generates key per click |
| App crash mid-request | Key persists in local storage, retried on restart |
| Network partition | Device queues ops, syncs with same keys |

## Consequences

### Positive
- **Financial Safety** - No duplicate charges, stock movements
- **Client Simplicity** - Generate key once, retry freely
- **Audit Trail** - Idempotency key links client→server

### Negative
- **Key Management** - Client must persist keys across sessions
- **Storage** - Unique indexes on large tables
- **Key Expiry** - Old keys never expire (by design)

## Key Generation Guidelines

1. **Deterministic** - Same operation = same key
2. **Scoped** - Include device/entity/version
3. **Opaque** - Server treats as string, no parsing
4. **Persistent** - Client stores in IndexedDB/localStorage

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Server-Generated IDs | Requires round-trip before offline write |
| Request Fingerprinting | Unreliable (headers vary, body ordering) |
| Database Constraints Only | No client-side duplicate detection |
