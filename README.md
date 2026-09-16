# Soko-OS

**The Operating System for African Businesses**

Soko POS is the first major application: **Fast, Offline-First Point of Sale for African Businesses**.

## Current milestone

**Milestone 1 — Local development platform (Docker-first)**

This repository is an existing GitHub clone. Do not create a nested repository.

## Prerequisites (host)

Verified on development hosts:

| Tool | Example |
|------|---------|
| Node.js | 22+ |
| pnpm | 11+ |
| Docker | 29+ |
| Docker Compose | 5+ |
| Git | 2+ |

PHP/Composer on the host are optional; the API runs via Docker (PHP-FPM).

PostgreSQL, Redis, Nginx, Mailpit, and MinIO run in Docker — do not install them on the host for standard development.

## Quick start

```bash
cp .env.example .env
pnpm install
pnpm dev:up
pnpm db:migrate
```

Open:

| Service | URL |
|---------|-----|
| App (Nginx) | http://localhost:8080 |
| Next.js direct | http://localhost:3001 |
| API health | http://localhost:8080/api/v1/health |
| Mailpit | http://localhost:8026 |
| MinIO console | http://localhost:9003 |

## Commands

```bash
pnpm dev:up        # build & start Docker stack
pnpm dev:down      # stop stack
pnpm dev:logs      # follow logs
pnpm dev:ps        # service status
pnpm db:migrate    # run Laravel migrations
pnpm db:seed       # seed (when seeders exist)
pnpm db:reset      # DESTRUCTIVE migrate:fresh --seed
pnpm dev:reset     # DESTRUCTIVE docker compose down -v
pnpm test:packages
pnpm test:frontend
pnpm test:backend
pnpm test:e2e
```

## Documentation

- [Developer Handbook](docs/SOKO-OS-DEVELOPER-HANDBOOK.md)
- [Developer Guide](docs/developer-guide.md)
- [Implementation Status](docs/implementation-status.md)
- [Troubleshooting](docs/troubleshooting.md)

## Repository layout

```text
apps/web          Next.js 15 (Soko POS) + TanStack Query + Dexie
apps/backend      Laravel 13 API
packages/*        Shared TypeScript packages
infrastructure/   Docker, Nginx, Postgres, scripts
docs/             Handbook, guides, ADRs
```
