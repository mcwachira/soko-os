# Soko-OS Backend Risk Register

**Version:** 1.0  
**Date:** 2026-09-13  
**Baseline:** Backend Comprehensive Audit & Gap Analysis  

---

## Risk Classification

| Probability | Impact | Risk Level |
|-------------|--------|------------|
| High | Critical | 🔴 Critical |
| High | High | 🔴 Critical |
| Medium | Critical | 🟠 High |
| High | Medium | 🟠 High |
| Medium | High | 🟠 High |
| Low | Critical | 🟡 Medium |
| Medium | Medium | 🟡 Medium |
| Low | High | 🟡 Medium |
| Low | Medium | 🟢 Low |
| Low | Low | 🟢 Low |

---

## Risk Register

| Risk ID | Title | Description | Probability | Impact | Level | Mitigation | Owner | Status | Residual |
|---------|-------|-------------|-------------|--------|-------|------------|-------|--------|----------|
| **RSK-001** | Kenya Regulatory Non-Compliance | KRA eTIMS not integrated. Operating without fiscalization is illegal in Kenya. Fines, shutdown risk. | High | Critical | 🔴 Critical | Implement KRA HTTP submission, obtain sandbox credentials, pursue certification. | Backend Lead | 🔴 Open | 🟠 High |
| **RSK-002** | Revenue Loss - No M-Pesa | 60%+ of Kenya transactions are M-Pesa. No STK Push = lost sales. | High | High | 🔴 Critical | Implement Daraja STK Push, callback, retry, reconciliation. | Backend Lead | 🔴 Open | 🟠 High |
| **RSK-003** | Financial Audit Failure | No accounting integration. Journal entries not created. Failed audit, tax penalties. | High | High | 🔴 Critical | Implement journal triggers, provider adapters, double-entry validation. | Backend Lead | 🔴 Open | 🟠 High |
| **RSK-004** | Data Corruption - Sync Conflicts | No conflict resolution API. Server-wins only. Concurrent edits cause data loss. | High | High | 🔴 Critical | Implement conflict resolution API, multiple strategies, UI. | Backend Lead | 🔴 Open | 🟠 High |
| **RSK-005** | Data Loss - Sync Deletes | Deleted entities not synced. Soft deletes not propagated. Orphaned records, confusion. | Medium | High | 🟠 High | Implement soft-delete sync, tombstone pattern. | Backend Lead | 🔴 Open | 🟠 Medium |
| **RSK-006** | Payment Fraud - No Webhook Verification | No webhook signature verification. Payment callbacks can be spoofed. | Medium | Critical | 🔴 Critical | Implement HMAC verification per provider. | Backend Lead | 🔴 Open | 🟠 High |
| **RSK-006** | Payment Idempotency Failures | No idempotency on payment endpoints. Duplicate charges on retry. | Medium | High | 🟠 High | Implement idempotency keys on payment endpoints. | Backend Lead | 🔴 Open | 🟠 Medium |
| RSK-007 | Concurrent Sale Race Condition | Two terminals sell same product. Inventory oversold. No row locking. | Medium | High | 🟠 High | Implement row locking (SELECT FOR UPDATE) on inventory. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-007 | Refund Race Condition | Two refunds against same sale. Double refund. No row locking. | Medium | High | 🟠 High | Implement row locking on refund. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-007 | Sync Race Condition | Two devices sync same entity. Lost updates. No optimistic locking on all entities. | Medium | High | 🟠 High | Implement optimistic locking on all sync entities. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-008 | No Rate Limiting | No rate limiting on auth, API. Brute force, DoS risk. | High | Medium | 🟠 High | Implement Laravel throttle middleware. | Backend Lead | 🟠 High | 🟢 Low |
| RSK-008 | No CORS/CSP | No CORS config, no CSP headers. XSS, clickjacking, data exfiltration. | Medium | High | 🟠 High | Configure CORS, CSP, security headers middleware. | Backend Lead | 🟠 High | 🟢 Low |
| RSK-009 | No Structured Logging | Default Laravel logging. No JSON, correlation IDs, context. Debugging impossible in prod. | High | Medium | 🟠 High | Implement Monolog JSON formatter, correlation IDs. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-010 | No Metrics/Monitoring | No Prometheus metrics. Blind in production. No alerting. | High | High | 🟠 High | Implement Prometheus metrics, Grafana dashboards. | DevOps | 🟠 High | 🟡 Medium |
| RSK-010 | No Audit Trail | Audit_logs table exists but empty. No audit events on sensitive actions. | High | High | 🟠 High | Implement model observers for critical actions. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-011 | No E2E Tests | Only 4 backend tests. No E2E. Regression risk high. | High | High | 🟠 High | Implement Playwright E2E for critical flows. | QA Lead | 🟠 High | 🟡 Medium |
| RSK-010 | Concurrency Bugs | No tests for concurrent sales, refunds, sync. Race conditions likely. | Medium | High | 🟠 High | Write concurrency tests, implement locks. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-011 | Fat Controllers | SaleController 1000+, SyncController 1700+ lines. Logic in controllers. | High | Medium | 🟠 High | Refactor to Action classes, single responsibility. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-011 | Business Logic in Controllers | Tax calc, inventory movement, cash shift in controllers. | High | Medium | 🟠 High | Extract to Action classes, Services. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-011 | No DTOs/API Resources | Raw arrays, raw models returned. Over-fetching, N+1, sensitive data leak. | Medium | Medium | 🟡 Medium | Implement DTOs, API Resources. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-012 | No OpenAPI Spec | No API documentation. Integration difficult, frontend/backend drift. | Medium | Medium | 🟡 Medium | Implement swagger-php, CI validation. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-012 | No CI/CD | No GitHub Actions. No automated tests, builds, deployments. | Medium | Medium | 🟡 Medium | GitHub Actions: lint, test, build, deploy. | DevOps | 🟡 Medium | 🟢 Low |
| RSK-013 | No Factories/Seeders | Only basic seeder. No factories. Tests use manual data. | Medium | Low | 🟡 Medium | Create factories for all models. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-013 | No Clean-room Test | Docs not verified from scratch. Documentation rot. | Medium | Medium | 🟡 Medium | Execute clean-room reproduction quarterly. | Tech Lead | 🟡 Medium | 🟢 Low |
| RSK-014 | M-Pesa Credentials Unavailable | Daraja sandbox credentials not available. STK Push blocked. | High | High | 🔴 Critical | Apply for Safaricom sandbox credentials. | Product Lead | 🔴 Open | 🔴 Critical |
| RSK-015 | KRA Credentials Unavailable | KRA sandbox/production credentials not available. Fiscalization blocked. | High | Critical | 🔴 Critical | Apply for KRA sandbox, pursue certification. | Product Lead | 🔴 Open | 🔴 Critical |
| RSK-015 | Accounting Provider Credentials | Zoho/QuickBooks/Xero OAuth credentials not available. | Medium | Medium | 🟡 Medium | Create developer accounts, configure OAuth. | Product Lead | 🟡 Medium | 🟡 Medium |
| RSK-016 | Database Constraint Gaps | No DB constraint on journal balance (debits=credits). Data integrity risk. | Low | Critical | 🟠 High | Add CHECK constraint or trigger. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-015 | No Double-Entry Validation | Journal entries not validated for balanced debits/credits. | Medium | High | 🟠 High | Model validation + DB constraint. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-017 | Fat Controllers - SaleController | 1000+ lines. Business logic in controller. Hard to test, maintain. | High | Medium | 🟠 High | Refactor to Action classes. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-017 | Fat Controllers - SyncController | 1700+ lines. Multi-entity logic in controller. | High | Medium | 🟠 High | Refactor to Action classes per entity. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-018 | No API Resources | Raw Eloquent models returned. Over-fetching, N+1, sensitive data. | Medium | Medium | 🟡 Medium | Implement API Resources for all endpoints. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-018 | No DTOs/Value Objects | Arrays passed everywhere. No type safety, validation duplication. | Medium | Medium | 🟡 Medium | Implement DTO classes for requests/responses. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-018 | Tight Coupling | KraEtimsService injected in controllers. Hard to test, swap. | Medium | Medium | 🟡 Medium | Use interfaces, container binding. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-019 | No Domain Events | Direct model manipulation. No event-driven side effects. | Medium | Medium | 🟡 Medium | Implement event system, listeners. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-019 | No Domain Events - Sync | Sync operations don't emit events. Integrations miss changes. | Medium | Medium | 🟡 Medium | Emit events on sync operations. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-020 | KRA Certification Unknown | KRA certification process unknown. Timeline, requirements unclear. | Medium | Critical | 🔴 Critical | Engage KRA early, document process. | Product Lead | 🔴 Open | 🟠 High |
| RSK-021 | M-Pesa Callback Security | No IP whitelist, no HMAC verification on callback. | Medium | Critical | 🔴 Critical | Implement Safaricom IP whitelist, HMAC. | Backend Lead | 🔴 Open | 🟠 High |
| RSK-022 | No Payment State Machine | Payment statuses as strings. No state machine, invalid transitions possible. | Medium | High | 🟠 High | Implement state machine (pending→processing→paid/failed). | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-023 | No Refund State Machine | Refunds not implemented. No state machine. | Medium | High | 🟠 High | Implement refund state machine. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-024 | No Return State Machine | Returns not implemented. No state machine. | Medium | High | 🟠 High | Implement return state machine. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-025 | No Purchase State Machine | Purchasing not implemented. No state machine. | Low | Medium | 🟡 Medium | Implement when purchasing built. | Backend Lead | 🟢 Low | 🟢 Low |
| RSK-026 | No Shift Approval Workflow | Shifts close without approval. No variance review. | Low | Medium | 🟡 Medium | Implement approval workflow. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-027 | No Shift Reports | No Z-report, X-report, daily summary. | Low | Medium | 🟡 Medium | Implement shift reports. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-028 | No Receipt Printing Hardware Test | ESC/POS endpoint exists but untested with hardware. | Low | Medium | 🟡 Medium | Test with thermal printer. | QA Lead | 🟡 Medium | 🟢 Low |
| RSK-029 | No Returns API | Returns/refunds not implemented. Schema only. | High | High | 🔴 Critical | Full implementation. | Backend Lead | 🔴 Open | 🟠 High |
| RSK-030 | No Refunds API | Refunds not implemented. Schema only. | High | High | 🔴 Critical | Full implementation. | Backend Lead | 🔴 Open | 🟠 High |
| RSK-031 | No Purchase Orders | Purchasing domain missing. | Medium | High | 🟠 High | Full implementation. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-031 | No Goods Receipts | No GRN workflow. | Medium | High | 🟠 High | Full implementation. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-031 | No Supplier Invoices | No supplier invoice matching. | Medium | High | 🟠 High | Full implementation. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-031 | No Supplier Payments | No AP payments. | Medium | High | 🟠 High | Full implementation. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-031 | No Purchase Returns | No purchase return workflow. | Low | Medium | 🟡 Medium | Full implementation. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-032 | No Stock Transfers | Branch/warehouse transfers missing. | Medium | High | 🟠 High | Full implementation. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-032 | No Stock Counts | No physical inventory count workflow. | Low | Medium | 🟡 Medium | Full implementation. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-032 | No Serial/Batch/Expiry | No tracking for regulated products. | Low | High | 🟠 High | Schema + implementation. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-033 | No Returns API | Returns not implemented. | High | High | 🔴 Critical | Full implementation. | Backend Lead | 🔴 Open | 🟠 High |
| RSK-033 | No Refunds API | Refunds not implemented. | High | High | 🔴 Critical | Full implementation. | Backend Lead | 🔴 Open | 🟠 High |
| RSK-034 | No Credit Notes | No credit note workflow. | Medium | High | 🟠 High | Full implementation. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-035 | No Shift Approval | No approval workflow. Variance unreviewed. | Low | Medium | 🟡 Medium | Implement approval. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-036 | No Shift Reports | No Z-report, X-report. | Low | Medium | 🟡 Medium | Implement reports. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-037 | Receipt Printing Untested | ESC/POS endpoint untested with hardware. | Low | Medium | 🟡 Medium | Test with thermal printer. | QA Lead | 🟡 Medium | 🟢 Low |
| RSK-038 | No Structured Logging | Default Laravel logging. No JSON, correlation IDs. | High | Medium | 🟠 High | Monolog JSON, correlation IDs. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-039 | No Metrics | No Prometheus metrics. Blind in prod. | High | High | 🟠 High | Prometheus client, Grafana. | DevOps | 🟠 High | 🟡 Medium |
| RSK-040 | No Audit Trail | Audit_logs table empty. No model observers. | High | High | 🟠 High | Model observers for critical actions. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-041 | No E2E Tests | Playwright placeholder only. | High | High | 🟠 High | Playwright setup, critical flows. | QA Lead | 🟠 High | 🟡 Medium |
| RSK-041 | No Concurrency Tests | No tests for concurrent operations. | High | High | 🟠 High | Pest tests for race conditions. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-042 | No OpenAPI Spec | No swagger-php. Integration difficult. | Medium | Medium | 🟡 Medium | swagger-php, CI validation. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-043 | No CI/CD | No GitHub Actions. Manual deploy. | Medium | Medium | 🟡 Medium | GitHub Actions: lint, test, build, deploy. | DevOps | 🟡 Medium | 🟢 Low |
| RSK-043 | No Database Docs | No schema.md, no ERD. | Medium | Low | 🟡 Medium | Auto-generate from migrations. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-044 | ADRs Missing | Only 3 of 15+. Architecture decisions undocumented. | Medium | Medium | 🟡 Medium | Write remaining 12 ADRs. | Tech Lead | 🟡 Medium | 🟢 Low |
| RSK-044 | Backend Dev Guide Missing | No backend-developer-guide.md. | High | Medium | 🟠 High | Write comprehensive guide. | Tech Lead | 🟠 High | 🟡 Medium |
| RSK-045 | No Clean-room Test | Docs not verified from scratch. | Medium | Medium | 🟡 Medium | Execute quarterly. | Tech Lead | 🟡 Medium | 🟢 Low |
| RSK-046 | KRA Credentials | KRA sandbox/production credentials unavailable. | High | Critical | 🔴 Critical | Apply for KRA sandbox. | Product Lead | 🔴 Open | 🔴 Critical |
| RSK-047 | M-Pesa Credentials | Daraja sandbox credentials unavailable. | High | High | 🔴 Critical | Apply for Safaricom sandbox. | Product Lead | 🔴 Open | 🔴 Critical |
| RSK-048 | Accounting Provider Credentials | Zoho/QBO/Xero OAuth credentials unavailable. | Medium | Medium | 🟡 Medium | Create dev accounts. | Product Lead | 🟡 Medium | 🟡 Medium |
| RSK-049 | DB Constraint - Journal Balance | No CHECK constraint on debits=credits. | Low | Critical | 🟠 High | Add CHECK constraint/trigger. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-050 | No Double-Entry Validation | Journal entries not validated for balance. | Medium | High | 🟠 High | Model validation + DB constraint. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-051 | Fat Controller - SaleController | 1000+ lines. Business logic in controller. | High | Medium | 🟠 High | Refactor to Action classes. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-051 | Fat Controller - SyncController | 1700+ lines. Multi-entity logic. | High | Medium | 🟠 High | Refactor to Action classes. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-052 | Business Logic in Controllers | Tax calc, inventory movement, cash shift in controllers. | High | Medium | 🟠 High | Extract to Action classes, Services. | Backend Lead | 🟠 High | 🟡 Medium |
| RSK-052 | No DTOs/Value Objects | Arrays passed everywhere. No type safety. | Medium | Medium | 🟡 Medium | Implement DTO classes. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-052 | No API Resources | Raw models returned. Over-fetching, N+1, sensitive data. | Medium | Medium | 🟡 Medium | Implement API Resources. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-053 | Tight Coupling | KraEtimsService injected in controllers. Hard to test. | Medium | Medium | 🟡 Medium | Use interfaces, container binding. | Backend Lead | 🟡 Medium | 🟢 Low |
| RSK-053 | No Domain Events | Direct model manipulation. No event-driven side effects. | Medium | Medium | 🟡 Medium | Implement event system. | Backend Lead | 🟡 Medium | 🟢 Low |

---

## Risk Summary by Category

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Compliance/Regulatory | 3 | 1 | 0 | 0 | 4 |
| Revenue/Financial | 3 | 2 | 1 | 0 | 6 |
| Data Integrity | 2 | 3 | 1 | 0 | 6 |
| Security | 1 | 3 | 2 | 0 | 6 |
| Data Loss | 1 | 3 | 1 | 0 | 5 |
| Architecture/Code Quality | 0 | 4 | 4 | 1 | 9 |
| Observability | 0 | 3 | 1 | 0 | 4 |
| Testing | 0 | 2 | 2 | 0 | 4 |
| External Dependencies | 3 | 0 | 1 | 0 | 4 |
| Architecture/Docs | 0 | 2 | 3 | 2 | 7 |
| **Total** | **13** | **22** | **18** | **1** | **55** |

---

## Top 10 Risks Requiring Immediate Action

| Rank | Risk ID | Title | Level | Action Required |
|------|---------|-------|-------|-----------------|
| 1 | RSK-001 | Kenya Regulatory Non-Compliance | 🔴 Critical | Apply for KRA sandbox, implement HTTP submission |
| 2 | RSK-002 | Revenue Loss - No M-Pesa | 🔴 Critical | Apply for Daraja sandbox, implement STK Push |
| 3 | RSK-003 | Financial Audit Failure | 🔴 Critical | Implement journal triggers, provider adapters |
| 4 | RSK-004 | Data Corruption - Sync Conflicts | 🔴 Critical | Conflict resolution API |
| 5 | RSK-006 | Payment Fraud - No Webhook Verification | 🔴 Critical | HMAC verification per provider |
| 6 | RSK-006 | Payment Idempotency | 🟠 High | Idempotency keys on payment endpoints |
| 7 | RSK-007 | Concurrent Race Conditions | 🟠 High | Row locking, optimistic locking |
| 8 | RSK-014 | M-Pesa Credentials Unavailable | 🔴 Critical | Apply for Safaricom sandbox |
| 9 | RSK-015 | KRA Credentials Unavailable | 🔴 Critical | Apply for KRA sandbox |
| 10 | RSK-001 | Returns/Refunds API | 🔴 Critical | Full implementation |

---

## Risk Acceptance Criteria

| Risk Level | Acceptance Criteria |
|------------|---------------------|
| 🔴 Critical | Must be resolved before any production deployment |
| 🟠 High | Must be resolved before pilot launch |
| 🟡 Medium | Must be resolved before full production launch |
| 🟢 Low | Can be addressed post-launch, tracked in backlog |

---

## Risk Monitoring

| Frequency | Activity | Owner |
|-----------|----------|-------|
| Daily | Monitor error rates, queue health, sync status | DevOps |
| Weekly | Review risk register, update status | Tech Lead |
| Sprint | Update risk register, assess new risks | Tech Lead |
| Monthly | Security scan, dependency audit | DevOps |
| Quarterly | Clean-room reproduction, risk register review | Tech Lead |

---

## Risk Acceptance Sign-off

| Risk ID | Risk Level | Accepted By | Date | Justification |
|---------|------------|-------------|------|---------------|
| RSK-014 | 🔴 Critical | | | Requires external application |
| RSK-015 | 🔴 Critical | | | Requires external application |
| RSK-016 | 🟠 High | | | DB migration required |
| RSK-017 | 🟠 High | | | Refactoring sprint |
| RSK-046 | 🔴 Critical | | | External dependency |
| RSK-047 | 🔴 Critical | | | External dependency |

---

*End of Risk Register*