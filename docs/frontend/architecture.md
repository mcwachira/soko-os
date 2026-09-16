# Frontend Architecture

## Stack

- **Next.js 15** — App Router, React Server Components, Turbopack
- **React 19** — concurrent features, `use` API
- **TypeScript** — strict mode enabled
- **Tailwind CSS v4** — CSS-first configuration, no JS config file
- **shadcn/ui** — Radix UI primitives + Tailwind
- **next-themes** — light/dark/system theme with persistence
- **Dexie** — offline-first IndexedDB
- **Vitest** — unit tests
- **TanStack Query v5** — server state management
- **React Hook Form + Zod** — form validation

## Data flow

```text
User action
  → React state / Server Action
  → API client (@soko/api-client workspace package)
  → Laravel API (/api/v1/*)
  → Postgres
← Response
← Dexie cache (offline fallback)
← Sync engine (@soko/sync workspace package)
```

## Offline-first

- Writes go to IndexedDB immediately via Dexie (`@soko/offline`).
- `@soko/sync` manages cursor-based push/pull.
- `hooks/useSync.ts` exposes `isOnline`, `isSyncing`, `pendingCount`.

## Theme

- `ThemeProvider` wraps the app in `src/app/layout.tsx`.
- CSS variables in `:root` and `.dark` hold oklch design tokens.
- Tailwind v4 `@theme` block maps tokens to utilities (`bg-background`, `text-foreground`, etc.).
- Shared `ThemeToggle` component used in marketing nav and app header.

## Monorepo

- `apps/web` depends on workspace packages (`@soko/*`).
- Workspace packages are the single source of truth for shared code.
- `next.config.js` transpiles workspace packages and aliases `@` → `src/`.

## Workspace Packages

| Package | Purpose |
|---------|---------|
| `@soko/domain-types` | TypeScript interfaces for all domain entities |
| `@soko/api-client` | HTTP client with typed methods |
| `@soko/offline` | Dexie database schema and queries |
| `@soko/sync` | Offline sync engine |
| `@soko/tax` | Tax calculation and country configs |
| `@soko/payments` | Payment provider interfaces |
| `@soko/accounting` | Chart of accounts and journal lines |
| `@soko/utils` | Shared utilities (formatMoney, UUID, etc.) |
| `@soko/validation` | Zod schemas for forms |

## Auth

- `AuthProvider` wraps the app in root layout.
- Token persisted to both `localStorage` and cookies.
- Middleware protects `(app)` routes and redirects to `/login`.
- Login page at `/login` with React Hook Form + Zod validation.
