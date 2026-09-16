# ADR-012 Nginx Reverse Proxy

## Decision

Nginx is the single browser entrypoint: `/` → Next.js, `/api` → Laravel PHP-FPM.

## Context

Same-origin routing simplifies cookies/CORS for POS and matches production edge patterns.

## Alternatives

- Separate localhost ports only — weaker DX and CORS friction
- Caddy — viable later; Nginx chosen for familiarity and ops docs

## Consequences

- Developers should prefer http://localhost:8080 over direct :3001/:9000 in normal workflows
