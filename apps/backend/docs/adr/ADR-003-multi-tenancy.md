# ADR-003: Multi-Tenancy Strategy

**Date:** 2026-09-13  
**Status:** Accepted

## Context

Soko-OS serves multiple organizations, each with multiple businesses, branches, and terminals. Data isolation is critical.

## Decision

**Shared Database, Shared Schema, Row-Level Security via Foreign Keys**

### Hierarchy
```
Organization (1)
  └── Business (N)
        └── Branch (N)
              ├── Warehouse (N)
              ├── Terminal (N)
              │     └── Device (N)
              └── User (N) [assigned to org + business]
```

### Implementation

1. **Foreign Key on Every Table**
   ```sql
   organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE
   ```

2. **Cascade Delete** - Deleting org cascades to all child data

3. **Middleware Enforcement** (`EnsureTenantAccess`)
   - Validates user has `organization_id`
   - Validates `branch_id`/`business_id` in request belongs to user's org
   - Adds `organization_id` to request for easy access

4. **Policy Enforcement**
   - All policies check `organization_id` match
   - Admins bypass via `Gate::before()`

5. **Query Scopes**
   ```php
   // Model trait
   public function scopeForTenant($query, $organizationId) {
       return $query->where("organization_id", $organizationId);
   }
   ```

## Consequences

### Positive
- **Strong Isolation** - Database-level FK constraints prevent leaks
- **Simple Queries** - Single `where` clause per query
- **Performance** - Indexes on `organization_id` + composite indexes
- **Cascade Cleanup** - Deleting org removes all data automatically

### Negative
- **No Row-Level Security (RLS)** - Relies on application layer
- **FK Overhead** - Every insert/update checks FK
- **Query Discipline** - Developers must remember tenant scope

## Mitigations

1. **Base Model Trait** - `TenantAware` trait with global scope (future)
2. **Static Analysis** - PHPStan rule to detect unscoped queries
3. **Code Review** - Checklist includes tenant isolation verification
4. **Tests** - Cross-tenant access tests in feature suite

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Separate Databases | Operational complexity, migrations, backup/restore |
| Schema-per-Tenant | Migration complexity, connection pooling issues |
| RLS (PostgreSQL) | Laravel ecosystem not optimized, debugging difficulty |
| Single Table (Discriminator) | Data leakage risk, performance at scale |

## Edge Cases

- **Super Admin** - Separate `system_admin` role with no `organization_id`
- **Cross-Branch Transfers** - Validated via service layer, not direct queries
- **Reporting** - Aggregated queries still scoped to organization
