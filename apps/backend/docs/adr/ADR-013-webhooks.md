# ADR-013: Webhook Handling Architecture

**Date:** 2026-09-13  
**Status:** Accepted

## Context

External providers (M-Pesa, Accounting, KRA) send asynchronous callbacks that must be processed reliably.

## Decision

**Secure Webhook Endpoints with Idempotency and Async Processing**

### Endpoint Pattern
```
POST /api/v1/webhooks/{provider}/{event}
```

Examples:
- `POST /api/v1/webhooks/mpesa/stk-callback`
- `POST /api/v1/webhooks/quickbooks/webhook`
- `POST /api/v1/webhooks/zoho/webhook`
- `POST /api/v1/webhooks/xero/webhook`
- `POST /api/v1/webhooks/kra/notification`

### Security

1. **Signature Verification** (where supported)
   ```php
   // M-Pesa: Validate callback against known IPs + checksum
   // QuickBooks: Verify Intuit-Signature header
   // Xero: Verify Xero-Signature header
   // Zoho: Validate X-Zoho-Webhook-Signature
   ```

2. **Idempotency Key**
   - Provider webhook ID or checksum as idempotency key
   - Store in `webhook_events` table with UNIQUE constraint

3. **Rate Limiting**
   - Per-provider rate limits
   - Burst allowance for batch webhooks

### Processing Flow
```
Provider → Webhook Endpoint
    │
    ├── Verify Signature
    │
    ├── Extract Idempotency Key
    │
    ├── Check Duplicate (webhook_events)
    │
    ├── Persist Raw Payload (webhook_events)
    │
    ├── Dispatch to Queue Job
    │       │
    │       └── Process Async (Update Payment, Sync Invoice, etc.)
    │
    └── Return 200 OK (Fast Response)
```

### Schema
```sql
webhook_events (
    id UUID PK,
    provider VARCHAR,           -- mpesa, quickbooks, xero, zoho, kra
    event_type VARCHAR,         -- stk_callback, invoice_update, etc.
    idempotency_key VARCHAR,    -- Provider webhook ID or hash
    payload JSONB,              -- Raw webhook payload
    status ENUM(pending, processing, completed, failed),
    retry_count INT DEFAULT 0,
    error_message TEXT,
    processed_at TIMESTAMP,
    created_at
)
```

### Queue Job Pattern
```php
class ProcessMpesaCallbackJob implements ShouldQueue {
    public function handle(array $payload): void {
        // 1. Parse callback
        $result = app(PaymentProviderManager::class)
            ->handleCallback("mpesa", $payload);
        
        // 2. Update payment record
        if ($result->success) {
            Payment::where("external_transaction_id", $result->externalTransactionId)
                ->update(["status" => "completed", "provider_response" => $payload]);
        }
        
        // 3. Trigger downstream (receipt, accounting, etc.)
        OutboxService::record("payment.completed", [
            "payment_id" => $payment->id,
        ]);
    }
}
```

### Retry Policy
- Immediate retry: 0
- Exponential backoff: 1m, 5m, 15m, 1h, 6h
- Max retries: 5
- Dead letter after max retries → admin notification

## Consequences

### Positive
- **Fast Response** - Webhook returns 200 immediately
- **Reliability** - Queue handles retries, failures
- **Idempotency** - Duplicate webhooks safely ignored
- **Observability** - All webhooks logged with status

### Negative
- **Latency** - Processing async, not immediate
- **Complexity** - Signature verification per provider
- **Ordering** - Webhooks may arrive out of order

## Implementation Checklist

- [ ] Webhook routes registered
- [ ] Signature verification per provider
- [ ] Idempotency key extraction
- [ ] Raw payload persistence
- [ ] Queue jobs for each provider
- [ ] Retry/backoff configuration
- [ ] Dead letter monitoring
- [ ] Health check includes webhook queue depth

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Synchronous Processing | Blocks provider, timeout risk, no retry |
| No Signature Verification | Security risk, replay attacks |
| Direct DB Update in Controller | No retry, transaction coupling |
