# ADR-011 Docker-First Development

## Decision

Local development runs through Docker Compose: Nginx, Next.js, PHP-FPM (Laravel), PostgreSQL, Redis, queue worker, scheduler, Mailpit, and MinIO.

## Context

African production realities and team onboarding require a reproducible environment without mandating host installs of Postgres/Redis/Nginx/MinIO.

## Alternatives

- Host PHP/Postgres/Redis only — rejected (drift, onboarding cost)
- Fully remote cloud dev — rejected for offline POS work

## Consequences

- First `pnpm dev:up` builds a PHP image (can take several minutes)
- Port mappings are configurable via `.env`
- Destructive resets use `docker compose down -v`
