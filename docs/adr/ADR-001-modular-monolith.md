# ADR-001 Modular Monolith

## Decision

Soko-OS ships as a modular monolith: one Laravel API, one primary web app, shared packages — not a mesh of microservices on day one.

## Context

POS, inventory, tax, and accounting share transactions and tenancy. Early microservice split would amplify sync and operational cost.

## Alternatives

- Microservices per module — deferred until scale/org boundaries demand it
- Separate repos per app — rejected for shared types/offline packages

## Consequences

- Clear package/module boundaries inside the monorepo
- Future extractability without premature distribution
