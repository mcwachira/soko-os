# ADR-011: Accounting Provider Adapters

**Date:** 2026-09-13  
**Status:** Accepted

## Context

Businesses need to sync financial data to external accounting systems (Zoho Books, QuickBooks Online, Xero, Sage, Odoo, ERPNext).

## Decision

**Common Adapter Interface with Provider-Specific Implementations**

### Interface
```php
interface AccountingProvider {
    public function connect(array $config): bool;
    public function disconnect(): void;
    public function isConnected(): bool;
    
    // Master Data Sync
    public function syncChartOfAccounts(): array;
    public function createCustomer(array $data): string;
    public function updateCustomer(string $externalId, array $data): bool;
    public function createProduct(array $data): string;
    public function updateProduct(string $externalId, array $data): bool;
    
    // Transaction Sync
    public function createInvoice(array $data): string;
    public function createCreditNote(array $data): string;
    public function createPayment(array $data): string;
    public function getInvoiceStatus(string $externalId): string;
    
    public function getName(): string;
}
```

### Implemented Providers

| Provider | Class | Auth | Status |
|----------|-------|------|--------|
| Zoho Books | `ZohoBooksAdapter` | OAuth2 (refresh_token) | Scaffold |
| QuickBooks Online | `QuickBooksAdapter` | OAuth2 (refresh_token) | Scaffold |
| Xero | `XeroAdapter` | OAuth2 (refresh_token) | Scaffold |
| Sage | `SageAdapter` | API Key | Planned |
| Odoo | `OdooAdapter` | API Key/Token | Planned |
| ERPNext | `ERPNextAdapter` | API Key/Token | Planned |

### Sync Flow
```
Local Journal Entry Created
        │
        ▼
OutboxEvent: accounting.journal_created
        │
        ▼
ProcessOutboxEventsJob
        │
        ▼
AccountingService::createSaleInvoice(Sale $sale)
        │
        ├── Sync Customer → Provider
        ├── Sync Products → Provider
        ├── Create Invoice → Provider
        └── Create Payment → Provider
        │
        ▼
Store External ID on Local Models
```

### Credential Management
```env
# Zoho Books
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
ZOHO_ORGANIZATION_ID=

# QuickBooks
QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=
QUICKBOOKS_ACCESS_TOKEN=
QUICKBOOKS_REFRESH_TOKEN=
QUICKBOOKS_REALM_ID=
QUICKBOOKS_DEPOSIT_ACCOUNT_ID=

# Xero
XERO_CLIENT_ID=
XERO_CLIENT_SECRET=
XERO_ACCESS_TOKEN=
XERO_REFRESH_TOKEN=
XERO_TENANT_ID=
XERO_BANK_ACCOUNT_CODE=
```

### Token Refresh
- All OAuth2 providers use `Cache::remember()` with TTL
- Automatic refresh on 401
- Refresh tokens rotated and persisted

### Mapping Strategy
| Local | Zoho Books | QuickBooks | Xero |
|-------|------------|------------|------|
| Customer | Contact (customer) | Customer | Contact |
| Product | Item (inventory) | Item (Inventory) | Item (tracked) |
| Sale Invoice | Invoice | Invoice | Invoice (ACCREC) |
| Credit Note | Credit Note | Credit Memo | Credit Note (ACCRECCREDIT) |
| Payment | Customer Payment | Payment | Payment |

## Consequences

### Positive
- **Provider Agnostic** - Core logic unchanged when adding providers
- **Resilient** - Outbox ensures at-least-once delivery
- **Observable** - Sync status tracked per transaction
- **Reversible** - Credit notes for returns/refunds

### Negative
- **Mapping Complexity** - Each provider different data model
- **Rate Limits** - Must batch and respect API quotas
- **Schema Drift** - Provider API changes break sync

## Implementation Status

| Provider | Connect | Customer | Product | Invoice | Credit Note | Payment | Status |
|----------|---------|----------|---------|---------|-------------|---------|--------|
| Zoho Books | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Scaffold |
| QuickBooks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Scaffold |
| Xero | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Scaffold |

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Direct API Calls in Controllers | Tight coupling, no retry, blocks request |
| Webhook-Only (Provider → Us) | Not all support, missing master data sync |
| Batch ETL (Nightly) | Stale data, reconciliation difficult |
