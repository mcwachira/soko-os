# Soko Books — Architecture & Accounting Model

## Overview

Soko Books is the accounting and financial records product within Soko-OS. It provides double-entry bookkeeping, invoicing, expenses, banking, and financial reporting for African businesses.

## Architecture

```
Soko-OS
  │
  ├── Soko POS
  │     └── Sale → AccountingService → Journal Entry
  │
  ├── Soko Commerce
  │     └── Order → AccountingService → Journal Entry
  │
  └── Soko Books
        ├── Chart of Accounts
        ├── Journal Engine
        ├── General Ledger
        ├── Invoices / Bills / Expenses
        ├── Banking / Reconciliation
        └── Financial Reports
```

## Core Concepts

### Chart of Accounts

- Hierarchical accounts organized by type: Asset, Liability, Equity, Revenue, Expense
- Standard numbering: 1000–6999
- System accounts protected from deletion
- Currency-aware

### Double-Entry Accounting

Every financial transaction produces balanced journal entries:

```
Total Debits = Total Credits
```

### Journal Entries

- `draft` → `posted` → `reversed`
- Linked to source documents (sale, invoice, expense, etc.)
- Immutable once posted
- Reversals create new journal entries

### Accounting Periods

- Fiscal years contain accounting periods
- Closed periods prevent mutation of posted transactions
- Controlled adjustment mechanisms

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| accounts | Chart of accounts |
| journal_entries | Journal entry headers |
| journal_lines | Journal entry lines (debits/credits) |
| invoices | Customer invoices |
| invoice_items | Invoice line items |
| bills | Vendor bills |
| bill_items | Bill line items |
| expenses | Operating expenses |
| expense_categories | Expense categorization |
| bank_accounts | Business bank accounts |
| bank_transactions | Bank statement transactions |
| bank_reconciliations | Reconciliation sessions |
| bank_reconciliation_items | Matched transactions |
| fiscal_years | Fiscal year definitions |
| accounting_periods | Monthly/period definitions |
| tax_rates | Configurable tax rules |

### Key Relationships

```
Organization
  └── Business
        ├── Branch
        │     ├── Account (optional)
        │     └── JournalEntry
        │           └── JournalLine
        │                 └── Account
        ├── Invoice
        │     └── InvoiceItem
        ├── Bill
        │     └── BillItem
        ├── Expense
        ├── BankAccount
        │     ├── BankTransaction
        │     └── BankReconciliation
        │           └── BankReconciliationItem
        └── FiscalYear
              └── AccountingPeriod
```

## API Surface

### Accounting

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/v1/accounts | List accounts |
| POST | /api/v1/accounts | Create account |
| PUT | /api/v1/accounts/{id} | Update account |
| GET | /api/v1/journal-entries | List journal entries |
| POST | /api/v1/journal-entries | Create journal entry |
| POST | /api/v1/journal-entries/{id}/post | Post journal entry |
| POST | /api/v1/journal-entries/{id}/reverse | Reverse journal entry |
| GET | /api/v1/ledger | General ledger |
| GET | /api/v1/reports/trial-balance | Trial balance |
| GET | /api/v1/reports/profit-loss | Profit & loss |
| GET | /api/v1/reports/balance-sheet | Balance sheet |
| GET | /api/v1/reports/cash-flow | Cash flow |

### Invoices

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/v1/invoices | List invoices |
| POST | /api/v1/invoices | Create invoice |
| PUT | /api/v1/invoices/{id} | Update invoice |
| DELETE | /api/v1/invoices/{id} | Void invoice |

### Bills

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/v1/bills | List bills |
| POST | /api/v1/bills | Create bill |
| PUT | /api/v1/bills/{id} | Update bill |
| DELETE | /api/v1/bills/{id} | Void bill |

### Expenses

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/v1/expenses | List expenses |
| POST | /api/v1/expenses | Create expense |
| PUT | /api/v1/expenses/{id} | Update expense |
| DELETE | /api/v1/expenses/{id} | Delete expense |

### Banking

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/v1/bank-accounts | List bank accounts |
| POST | /api/v1/bank-accounts | Create bank account |
| GET | /api/v1/bank-transactions | List transactions |
| POST | /api/v1/bank-transactions | Create transaction |
| GET | /api/v1/bank-reconciliations | List reconciliations |
| POST | /api/v1/bank-reconciliations | Create reconciliation |

## Frontend Structure

```
apps/web/src/app/(app)/
  accounting/
    page.tsx                    # Chart of accounts
  journals/
    page.tsx                    # Journal entries
  ledger/
    page.tsx                    # General ledger
  reports/
    trial-balance/page.tsx
    profit-loss/page.tsx
    balance-sheet/page.tsx
    cash-flow/page.tsx
  invoices/
    page.tsx                    # Invoice list
    create/page.tsx             # Create invoice
    [id]/page.tsx               # Invoice detail
  bills/
    page.tsx                    # Bill list
    create/page.tsx             # Create bill
  expenses/
    page.tsx                    # Expense list
    create/page.tsx             # Create expense
  bank-accounts/page.tsx
  bank-transactions/page.tsx
  bank-reconciliation/page.tsx
  settings/page.tsx             # Fiscal years, periods, tax rates
```

## Accounting Integrity

- All posted journals must balance (debits = credits)
- Trial balance validates ledger consistency
- Balance sheet validates accounting equation (Assets = Liabilities + Equity)
- Tenant isolation enforced on every query
- System accounts protected from deletion
- Period locks prevent mutation of historical data

## Testing

- 85 backend tests passing (393 assertions)
- Accounting integrity tests verify:
  - Posted journals always balance
  - Trial balance sums match
  - Balance sheet balances
  - Sales generate balanced journals
  - Payments generate balanced journals
  - Tenant isolation across all modules

## External Integrations

| Integration | Status |
|-------------|--------|
| Zoho Books | 🔒 Blocked — OAuth credentials required |
| QuickBooks | 🔒 Blocked — OAuth credentials required |
| Xero | 🔒 Blocked — OAuth credentials required |

Adapters are scaffolded and ready for credentials.

## Roadmap

1. **Complete** — Core accounting engine, invoices, bills, expenses, banking, reports
2. **Next** — Accounting period lock UI, E2E tests, CI/CD
3. **Later** — External accounting sync, advanced reconciliation, CSV imports
