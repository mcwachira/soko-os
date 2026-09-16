# Next.js

## Version

Next.js **15.5.25** with React **19**.

## App Router

All routes live under `apps/web/src/app/`.

Key files:
- `src/app/layout.tsx` — root layout
- `src/app/page.tsx` — POS home
- `src/app/loading.tsx` — loading fallback
- `src/app/error.tsx` — error boundary
- `src/app/not-found.tsx` — 404

## Scripts

```bash
pnpm dev           # next dev --port 3000
pnpm build         # next build
pnpm start         # next start
pnpm lint          # next lint
pnpm typecheck     # tsc --noEmit
pnpm test          # vitest run
pnpm test:e2e      # playwright test
```

## Aliases

`tsconfig.json` paths:
```json
{
  "@/*": ["./src/*"]
}
```

`next.config.js` webpack aliases mirror these plus workspace packages.

## State Management

- **Server state**: TanStack Query v5 (`@tanstack/react-query`) for API data caching, mutations, and background refetching.
- **Client state**: React `useState`/`useReducer` in components.
- **Auth state**: `AuthProvider` context wrapping the app.
- **Offline state**: Dexie (IndexedDB) + sync engine.

## Testing

- **Unit**: Vitest for logic, tax calculations, and offline Dexie operations.
- **E2E**: Playwright for POS flows (login, cart, checkout, shift lifecycle).

## Turborepo

```bash
pnpm build        # turbo run build
pnpm typecheck    # turbo run typecheck
pnpm lint         # turbo run lint
```

`turbo.json` defines `build`, `typecheck`, `lint`, `test`, and `dev` tasks.
