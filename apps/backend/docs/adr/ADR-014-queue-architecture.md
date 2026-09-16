# ADR-014: Queue Architecture

**Date:** 2026-09-13  
**Status:** Accepted

## Context

Background jobs for tax submission, accounting sync, webhook processing, notifications, and reports.

## Decision

**Redis-Backed Queues with Priority and Dedicated Workers**

### Queue Connections
```php
// config/queue.php
"connections" => [
    "redis" => [
        "driver" => "redis",
        "connection" => "default",
        "queue" => "default",
        "retry_after" => 90,
        "block_for" => 5,
    ],
],
```

### Queue Names & Priorities
| Queue | Purpose | Priority | Workers |
|-------|---------|----------|---------|
| `high` | Tax submission, payment callbacks | 10 | 2 |
| `default` | Accounting sync, webhooks | 5 | 3 |
| `low` | Reports, exports, cleanup | 1 | 1 |
| `failed` | Dead letter | - | - |

### Job Configuration
```php
class FiscalizeSaleJob implements ShouldQueue {
    public $queue = "high";
    public $tries = 3;
    public $backoff = [60, 300, 900];  // 1m, 5m, 15m
    public $timeout = 120;
}

class ProcessOutboxEventsJob implements ShouldQueue {
    public $queue = "default";
    public $tries = 1;
    public $timeout = 60;
}

class GenerateReportJob implements ShouldQueue {
    public $queue = "low";
    public $tries = 2;
    public $backoff = [300, 600];
    public $timeout = 300;
}
```

### Worker Configuration
```yaml
# docker-compose.yml
queue:
  command: php artisan queue:work redis --queue=high,default,low --tries=3 --timeout=120

scheduler:
  command: sh -c "while true; do php artisan schedule:run; sleep 60; done"
```

### Monitoring
- **Horizon** (future) - Dashboard for queue metrics
- **Custom Metrics** - Prometheus exporter for:
  - `queue_jobs_pending{queue}`
  - `queue_jobs_failed_total{queue}`
  - `queue_job_duration_seconds{job}`
  - `queue_worker_count{queue}`

### Retry Strategy
| Attempt | Delay | Use Case |
|---------|-------|----------|
| 1 | Immediate | Transient network |
| 2 | 1 minute | Temporary unavailability |
| 3 | 5 minutes | Extended outage |
| 4 | 15 minutes | Provider maintenance |
| 5 | 1 hour | Manual intervention needed |

### Dead Letter Handling
- After max tries → `failed_jobs` table
- Admin notification (email/Slack)
- Manual retry via `php artisan queue:retry {id}`

### Scheduler Jobs
```php
// routes/console.php
Schedule::job(new ProcessOutboxEventsJob())->everyMinute();
Schedule::job(new AutoSyncJob($deviceId))->everyFiveMinutes();
Schedule::command("outbox:cleanup")->weekly();
Schedule::command("metrics:collect")->everyFiveMinutes();
```

## Consequences

### Positive
- **Separation of Concerns** - Priority queues prevent starvation
- **Observability** - Per-queue metrics
- **Scalability** - Add workers per queue independently
- **Reliability** - Retry/backoff handles transient failures

### Negative
- **Redis Dependency** - Queue unavailable if Redis down
- **Worker Management** - Must monitor worker health
- **Job Ordering** - FIFO per queue, no cross-queue ordering

## Implementation Checklist

- [x] Redis queue connection
- [x] Queue definitions in config/queue.php
- [x] Job classes with queue/tries/backoff
- [x] Worker docker service
- [x] Scheduler docker service
- [ ] Horizon dashboard (production)
- [ ] Prometheus metrics endpoint
- [ ] Alerting on failed job spike
- [ ] Queue health check in /health

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Database Queue | Polling overhead, no priority, slower |
| RabbitMQ | Extra infrastructure, operational burden |
| Laravel Octane + Queue | Experimental, complexity |
| Sync Execution | Blocks HTTP, no retry, poor UX |
