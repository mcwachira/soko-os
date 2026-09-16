# ADR-006: Synchronization Architecture

**Date:** 2026-09-13  
**Status:** Accepted

## Context

POS terminals operate offline-first. Changes must sync when online without data loss or conflicts.

## Decision

**Cursor-Based Delta Sync with Idempotency Keys**

### Push (Device → Server)
```
POST /api/v1/sync/push
{
  "device_id": "uuid",
  "branch_id": "uuid",
  "operations": [
    {
      "operation_id": "local-op-1",
      "entity_name": "sales",
      "action": "create",
      "local_id": "local-sale-1",
      "idempotency_key": "device-uuid:local-sale-1:v1",
      "data": { ... }
    }
  ]
}
```

### Pull (Server → Device)
```
POST /api/v1/sync/pull
{
  "branch_id": "uuid",
  "since_cursor": "1726123456",
  "limit": 500,
  "entities": ["products", "categories", "customers"]
}
```

Response:
```json
{
  "next_cursor": "1726123999",
  "has_more": true,
  "changes": {
    "products": [...],
    "categories": [...]
  }
}
```

### Idempotency
- `idempotency_key` = `device_uuid:entity:local_id:version`
- Unique constraint on `sync_operations.idempotency_key`
- Duplicate pushes return original server ID

### Conflict Detection
- **Optimistic Locking** on `products.version`
- Server returns `server_version`, `server_data`, `resolution: server_wins`
- Client resolves via `/sync/conflicts/{id}/resolve`

### Deletion Handling
- Soft deletes synced as `action: delete` with `deleted_at` timestamp
- Tombstones retained for 30 days

## Data Flow

```
Device (Offline)
    │
    ├── Write to IndexedDB (Dexie)
    │
    ├── Online Event → Auto Sync
    │         │
    │         ▼
    │    POST /sync/push
    │         │
    │         ▼
Server          Validates idempotency
    │         Detects conflicts
    │         Applies changes
    │         Records sync_operations
    │         │
    │         ▼
    │    POST /sync/pull (or webhook)
    │         │
    │         ▼
Device (Online) ← Receives cursor + changes
    │
    └── Updates local cursor
```

## Consequences

### Positive
- **Offline-First** - Full write capability offline
- **Deterministic** - Idempotency prevents duplicates
- **Audit Trail** - Every sync operation logged
- **Scalable** - Cursor-based pull avoids full dataset transfer

### Negative
- **Conflict Complexity** - Requires resolution UI/strategy
- **Cursor Management** - Client must persist cursor reliably
- **Schema Evolution** - Must handle entity schema changes

## Implementation Details

### Cursor Format
- Unix timestamp (seconds) of last successful pull
- Server returns `next_cursor` = current timestamp
- Client stores and sends `since_cursor` on next pull

### Entity Versioning
- Products: `version` column (optimistic lock)
- Others: `updated_at` timestamp for delta queries

### Auto-Sync
- Scheduler checks online devices every 5 minutes
- Dispatches `AutoSyncJob` for devices with pending ops

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Full State Sync | Bandwidth, latency, conflicts on every field |
| CRDTs | Complexity, not needed for POS data patterns |
| Event Sourcing (Client) | Overkill, IndexedDB already event-like |
| WebSocket Push | Unreliable on mobile networks, battery drain |
