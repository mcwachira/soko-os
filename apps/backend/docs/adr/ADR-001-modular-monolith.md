# ADR-001: Modular Monolith Architecture

**Date:** 2026-09-13  
**Status:** Accepted

## Context

Soko-OS needs to support multiple business domains (POS, Inventory, Payments, Tax, Accounting, Sync) while maintaining operational simplicity for deployment and development.

## Decision

We will use a **Modular Monolith** architecture where:

1. **Single Laravel Application** - One deployable unit
2. **Domain-Driven Modules** - Code organized by business domain under `app/`
3. **Shared Kernel** - Common infrastructure (multi-tenancy, auth, queue, events)
4. **Module Boundaries** - Enforced via namespace/service layer, not separate processes

### Module Structure

```
app/
├── Domain/
│   ├── Identity/          # Users, Roles, Permissions
│   ├── Tenancy/           # Organizations, Businesses, Branches
│   ├── Catalog/           # Products, Categories, Brands
│   ├── Inventory/         # Movements, Transfers, Counts
│   ├── Sales/             # Sales, Quotes, Orders
│   ├── Payments/          # Providers, Intents, Refunds
│   ├── Cash/              # Shifts, Floats, Reconciliation
│   ├── Returns/           # Returns, Refunds, Exchanges
│   ├── Purchasing/        # Suppliers, POs, GRNs
│   ├── Tax/               # Calculation, KRA eTIMS, Providers
│   ├── Accounting/        # Ledger, Journals, Providers
│   ├── Sync/              # Push, Pull, Conflict Resolution
│   └── Reporting/         # Reports, Analytics
├── Application/           # Use cases, Actions, Commands
├── Infrastructure/        # Repositories, Adapters, External APIs
└── Presentation/          # Controllers, Resources, Requests
```

## Consequences

### Positive
- **Simple Deployment** - Single container, single database
- **Strong Consistency** - ACID transactions across domains
- **Type Safety** - Shared types, IDE support across modules
- **Refactoring** - Easy to move code between modules
- **Testing** - Fast integration tests without network

### Negative
- **Coupling Risk** - Must enforce boundaries via code review
- **Scaling** - Cannot scale modules independently
- **Team Autonomy** - Requires coordination for shared kernel changes

## Enforcement

1. **Code Reviews** - Check for cross-module imports
2. **Static Analysis** - PHPStan rules for module boundaries
3. **Module Tests** - Each domain has dedicated test suite
4. **Documentation** - ADRs for cross-cutting decisions

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Microservices | Operational complexity, distributed transactions, network latency |
| Modular Monolith (Symfony bundles) | Laravel ecosystem, team expertise |
| Separate Laravel Apps | Shared multi-tenancy, auth, sync engine duplication |

## Implementation Notes

- Domain modules communicate via **Events** and **Service Contracts**
- No direct model access across domains - use Repository/Service interfaces
- Shared kernel: `App\Models\TenantAware`, `App\Services\OutboxService`, `App\Http\Middleware\EnsureTenantAccess`
