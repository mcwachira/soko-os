# ADR-015: Structured Logging & Observability

**Date:** 2026-09-13  
**Status:** Accepted

## Context

Production debugging, audit trails, and monitoring require consistent, structured logs with correlation IDs.

## Decision

**JSON Structured Logging with Correlation IDs**

### Log Format (JSON)
```json
{
  "timestamp": "2026-09-13T10:30:45.123Z",
  "level": "info",
  "environment": "production",
  "service": "soko-os-backend",
  "request_id": "req-abc123",
  "correlation_id": "corr-xyz789",
  "user_id": "user-uuid",
  "organization_id": "org-uuid",
  "business_id": "biz-uuid",
  "branch_id": "branch-uuid",
  "device_id": "device-uuid",
  "event": "sale.created",
  "message": "Sale completed successfully",
  "context": {
    "sale_id": "sale-uuid",
    "receipt_number": "REC-NRB01-20260913-ABC123",
    "grand_total_minor": 116000,
    "payment_methods": ["cash", "mpesa"]
  }
}
```

### Implementation

#### 1. Correlation ID Middleware
```php
// App\Http\Middleware\CorrelationIdMiddleware
public function handle(Request $request, Closure $next): Response {
    $correlationId = $request->header("X-Correlation-ID") 
        ?? $request->header("X-Request-ID")
        ?? Str::uuid()->toString();
    
    $request->attributes->set("correlation_id", $correlationId);
    
    $response = $next($request);
    $response->headers->set("X-Correlation-ID", $correlationId);
    return $response;
}
```

#### 2. Structured Logger Service
```php
class StructuredLogger {
    public function withContext(array $context): self;
    public function withUser(string $userId): self;
    public function withOrganization(string $orgId): self;
    public function info(string $message, array $context = []): void;
    public function error(string $message, array $context = []): void;
    // ... warning, debug, critical, etc.
}
```

#### 3. Logging Channel (config/logging.php)
```php
"channels" => [
    "structured" => [
        "driver" => "monolog",
        "handler" => StreamHandler::class,
        "handler_with" => ["stream" => storage_path("logs/structured.log")],
        "formatter" => JsonFormatter::class,
        "formatter_with" => ["batch_mode" => JsonFormatter::BATCH_MODE_JSON],
    ],
    "stack" => ["channels" => ["single", "structured"]],
],
```

### Standard Fields
| Field | Source | Required |
|-------|--------|----------|
| `timestamp` | Auto | Yes |
| `level` | Logger | Yes |
| `environment` | `app()->environment()` | Yes |
| `service` | `"soko-os-backend"` | Yes |
| `request_id` | Middleware | Yes |
| `correlation_id` | Middleware/Client | Yes |
| `user_id` | Auth context | When auth |
| `organization_id` | Tenant context | When tenant |
| `business_id` | Tenant context | When tenant |
| `branch_id` | Tenant context | When tenant |
| `device_id` | Header/Auth | When mobile |
| `event` | Domain event name | Yes |
| `message` | Human-readable | Yes |
| `context` | Structured data | Optional |

### Usage Patterns
```php
// In Controller
$logger = StructuredLogger::make($request->attribute("correlation_id"))
    ->withUser($user->id)
    ->withOrganization($user->organization_id)
    ->withBusiness($user->business_id)
    ->withBranch($branchId)
    ->withDevice($deviceId)
    ->withAction("sale.create");

$logger->info("Sale created", [
    "sale_id" => $sale->id,
    "receipt_number" => $sale->receipt_number,
    "grand_total_minor" => $sale->grand_total_minor,
]);

// In Job
$logger = StructuredLogger::make()->withCorrelationId($correlationId);
$logger->info("FiscalizeSaleJob started", ["sale_id" => $saleId]);
```

### Log Levels
| Level | Use Case |
|-------|----------|
| `emergency` | System unusable |
| `alert` | Immediate action required |
| `critical` | Critical component failure |
| `error` | Operation failed, user impact |
| `warning` | Degraded, potential issue |
| `notice` | Significant business event |
| `info` | Normal operation milestone |
| `debug` | Detailed diagnostic |

### Sensitive Data Redaction
```php
// Never log:
["password", "token", "secret", "api_key", "private_key", "card_number", "cvv", "pin"]

// Automatic redaction in formatter
$formatter = new JsonFormatter();
$formatter->includeStacktraces = false;
```

### Log Retention
- **Structured logs:** 30 days (rotated daily)
- **Audit logs:** 7 years (database)
- **Error logs:** 90 days

### Integration
- **Loki/Grafana** - Log aggregation
- **Sentry** - Error tracking (errors only)
- **Datadog/New Relic** - APM correlation

## Consequences

### Positive
- **Debugging** - Trace requests across services
- **Audit** - Structured events for compliance
- **Monitoring** - Alert on error patterns
- **Performance** - JSON parsing fast in log aggregators

### Negative
- **Storage** - JSON larger than text logs
- **Migration** - Existing logs not structured
- **Discipline** - Developers must use structured logger

## Implementation Checklist

- [x] CorrelationIdMiddleware
- [x] StructuredLogger service
- [x] JSON logging channel
- [x] Stack channel includes structured
- [ ] Automatic context injection (tenant, user)
- [ ] Sensitive field redaction
- [ ] Log rotation configuration
- [ ] Loki/Grafana integration
- [ ] Sentry error tracking

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Plain Text Logs | Hard to query, parse, correlate |
| Syslog Only | Limited structure, no JSON |
| ELK Stack Only | Overkill for logging, use Loki |
| Custom Binary Format | Not human-readable, tooling gap |
