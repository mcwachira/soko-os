# ADR-002: PostgreSQL as Primary Database

**Date:** 2026-09-13  
**Status:** Accepted

## Context

Soko-OS requires a robust relational database for financial data, multi-tenancy, and complex queries.

## Decision

Use **PostgreSQL 16** as the primary database.

## Rationale

| Requirement | PostgreSQL Fit |
|-------------|----------------|
| ACID Compliance | Full ACID for financial transactions |
| JSON Support | JSONB for flexible payloads (sync, webhooks, provider responses) |
| UUID Support | Native `uuid` type with `gen_random_uuid()` |
| Advisory Locks | `pg_advisory_lock` for distributed synchronization |
| Window Functions | Running balances for inventory ledger |
| CTEs | Recursive category hierarchies |
| Partial Indexes | Efficient tenant-scoped queries |
| Partitioning | Future-proof for large tables (audit_logs, inventory_movements) |
| Extensions | `pg_trgm` for search, `pg_stat_statements` for monitoring |

## Configuration

- **Charset:** UTF8
- **Collation:** en_US.UTF-8
- **Timezone:** UTC (application handles user timezones)
- **Connection Pooling:** PgBouncer in production
- **Read Replicas:** For reporting queries

## Consequences

### Positive
- **Data Integrity** - Constraints, FKs, triggers enforce business rules
- **Performance** - Advanced query planner, parallel queries
- **Observability** - `pg_stat_statements`, `pg_stat_activity`
- **Ecosystem** - Rich tooling (pgAdmin, DBeaver, TimescaleDB)

### Negative
- **Operational Overhead** - More complex than SQLite/MySQL
- **Memory Usage** - Higher baseline memory per connection

## Migration Strategy

- All migrations use Laravel Schema Builder (DB-agnostic where possible)
- PostgreSQL-specific features via raw SQL in migrations when needed
- Test against PostgreSQL in CI (GitHub Actions service container)

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| MySQL 8 | Weaker JSON support, no partial indexes, limited CTE optimization |
| SQLite | No concurrent writes, no network access, not production-ready |
| MariaDB | Similar to MySQL, less advanced features |
