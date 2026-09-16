# ADR-005: Financial Ledger (Double-Entry Accounting)

**Date:** 2026-09-13  
**Status:** Accepted

## Context

Sales, payments, refunds, purchases must generate balanced journal entries for accounting integration and audit.

## Decision

**Double-Entry Ledger with Explicit Journal Tables**

### Schema
```sql
accounts (
    id, organization_id, business_id, code, name, 
    type ENUM(asset, liability, equity, revenue, expense),
    currency, is_active
)

journal_entries (
    id, organization_id, business_id,
    reference_type, reference_id,  -- polymorphic: sale, purchase, payment, shift_close
    entry_date, notes
)

journal_lines (
    id, journal_entry_id, account_id,
    description, debit_minor, credit_minor
)
```

### Invariant
```sql
-- Every journal_entry MUST balance:
SUM(debit_minor) = SUM(credit_minor) OVER (PARTITION BY journal_entry_id)
```

### Generation Rules

| Event | Debits | Credits |
|-------|--------|---------|
| Sale (cash) | Cash, COGS, Inventory | Revenue, VAT, Discount |
| Sale (credit) | AR, COGS, Inventory | Revenue, VAT, Discount |
| Payment (cash) | Cash | AR |
| Payment (mpesa) | Bank/MPESA | AR |
| Refund | Revenue, VAT | Cash/AR |
| Purchase | Inventory, VAT | AP |
| Shift Close | Cash | Cash (variance to P&L) |

### Default Chart of Accounts (per business)
```
1000 - Cash/Bank (asset)
1200 - Accounts Receivable (asset)
1300 - Inventory (asset)
1500 - M-Pesa Float (asset)

2000 - Accounts Payable (liability)
2200 - VAT Payable (liability)

3000 - Owner Equity (equity)

4000 - Sales Revenue (revenue)
4100 - Sales Discounts (revenue)
4200 - Sales Returns (revenue)

5000 - Cost of Goods Sold (expense)
5100 - Shrinkage/Damage (expense)
5200 - Payment Fees (expense)
```

## Implementation

### Service Layer
```php
class AccountingService {
    public function generateJournalEntry(Sale $sale): ?JournalEntry;
    public function generateJournalEntry(Payment $payment): ?JournalEntry;
    public function generateJournalEntry(Refund $refund): ?JournalEntry;
}
```

### Outbox Integration
```php
// After journal created:
OutboxService::record("accounting.journal_created", [
    "journal_entry_id" => $entry->id,
    "reference_type" => $entry->reference_type,
    "reference_id" => $entry->reference_id,
]);
```

### Provider Sync
- Zoho Books, QuickBooks, Xero adapters implement `AccountingProvider`
- Sync runs via scheduled job or webhook
- Outbox ensures at-least-once delivery

## Consequences

### Positive
- **Audit Trail** - Every financial event traceable to journal
- **Provider Agnostic** - Internal ledger independent of external system
- **Reconciliation** - Can match internal ledger to provider
- **Reporting** - Trial balance, P&L, balance sheet from ledger

### Negative
- **Complexity** - Must maintain balance invariant
- **Performance** - Journal generation adds write overhead
- **Mapping** - Chart of accounts must map to each provider

## Validation

1. **Application-Level** - Service validates balance before insert
2. **Database Trigger** (future) - `CHECK` constraint or trigger on insert
3. **Reconciliation Job** - Daily job verifies all journals balance

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Single-Entry (Income/Expense) | Insufficient for accounting integration, no balance sheet |
| External-Only (Zoho/QuickBooks) | Vendor lock-in, offline capability lost, audit risk |
| No Ledger (Direct Provider API) | No local audit trail, sync failures cause data loss |
