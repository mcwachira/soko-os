# ADR-008: Outbox Pattern for Reliable Event Delivery

**Date:** 2026-09-13  
**Status:** Accepted

## Context

External integrations (KRA, Accounting, Webhooks) must not block database transactions or lose events on failure.

## Decision

**Transactional Outbox with Polling Publisher**

### Schema
```sql
outbox_events (
    id UUID PK,
    organization_id FK,
    event_name VARCHAR,      -- sale.created, payment.completed, etc.
    payload JSONB,           -- Event data
    status ENUM(pending, processing, published, failed),
    retry_count INT DEFAULT 0,
    error_message TEXT,
    created_at, updated_at
)
```

### Write Path (In Same Transaction)
```php
DB::transaction(function () {
    $sale = Sale::create([...]);
    
    // Business logic...
    
    // Record outbox event (SAME TRANSACTION)
    OutboxEvent::create([
        "event_name" => "sale.created",
        "payload" => [
            "sale_id" => $sale->id,
            "amount" => $sale->grand_total_minor,
        ],
        "organization_id" => $sale->organization_id,
    ]);
});
```

### Publish Path (Separate Process)
```php
// Scheduled job runs every minute
class ProcessOutboxEventsJob {
    public function handle() {
        $events = OutboxEvent::where("status", "pending")
            ->where("retry_count", "<", 5)
            ->orderBy("created_at")
            ->limit(100)
            ->get();

        foreach ($events as $event) {
            $event->update(["status" => "processing"]);
            
            try {
                $this->dispatch($event);  // Route to handler
                $event->update([
                    "status" => "published",
                    "retry_count" => 0,
                ]);
            } catch (\Throwable $e) {
                $event->update([
                    "status" => "failed",
                    "retry_count" => $event->retry_count + 1,
                    "error_message" => $e->getMessage(),
                ]);
            }
        }
    }
}
```

### Event Routing
```php
private function dispatch(OutboxEvent $event): void {
    match ($event->event_name) {
        "sale.created" => FiscalizeSaleJob::dispatch($event->payload["sale_id"]),
        "sale.updated" => UpdateAccountingJob::dispatch($event->payload),
        "customer.created" => SyncCustomerToAccountingJob::dispatch($event->payload),
        "product.updated" => SyncProductToAccountingJob::dispatch($event->payload),
        "shift.closed" => ReconcileShiftJob::dispatch($event->payload),
        default => Log::warning("Unknown outbox event", ["event" => $event->event_name]),
    };
}
```

## Consequences

### Positive
- **Atomicity** - Business data + event in same transaction
- **Reliability** - Events never lost, retried with backoff
- **Ordering** - FIFO per organization (via `created_at`)
- **Observability** - Failed events queryable for manual retry
- **Decoupling** - Publishers don't know subscribers

### Negative
- **Latency** - Events processed after transaction commits
- **Duplication** - At-least-once delivery (consumers must be idempotent)
- **Polling Overhead** - Scheduled job runs every minute

## Dead Letter Handling

- After 5 retries → `status = failed`, `retry_count >= 5`
- Admin UI lists failed events for manual intervention
- `OutboxService::retryEvent($id)` resets for retry

## Event Catalog

| Event | Payload | Consumers |
|-------|---------|-----------|
| `sale.created` | sale_id | KRA fiscalize, Accounting sync |
| `sale.updated` | sale_id | Accounting sync |
| `payment.completed` | payment_id | Accounting sync, Receipt print |
| `refund.completed` | refund_id | KRA credit note, Accounting sync |
| `customer.created` | customer_id | Accounting sync (contacts) |
| `product.updated` | product_id | Accounting sync (items), Sync push |
| `shift.closed` | shift_id | Reconciliation, Accounting sync |
| `inventory.adjusted` | movement_id | Accounting sync (COGS) |

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Direct HTTP in Transaction | Blocks DB, timeout risk, no retry |
| Message Queue (RabbitMQ/Kafka) | Operational complexity, separate infrastructure |
| CDC (Debezium) | Overkill, schema coupling, operational burden |
| Laravel Events + Queue | No persistence if queue fails before dispatch |
