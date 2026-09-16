# Frontend Project Structure

## Canonical layout

```text
apps/web/
├── src/
│   ├── app/                          # Next.js App Router (canonical)
│   │   ├── globals.css               # Tailwind v4 import + design tokens
│   │   ├── layout.tsx                # Root layout (ThemeProvider + AuthProvider + QueryProvider)
│   │   ├── page.tsx                  # Homepage (marketing)
│   │   ├── (marketing)/              # Public marketing pages
│   │   │   ├── layout.tsx            # Marketing layout (nav + footer)
│   │   │   ├── login/page.tsx        # Authentication
│   │   │   ├── about/page.tsx
│   │   │   ├── blog/page.tsx
│   │   │   ├── compliance/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── countries/page.tsx
│   │   │   ├── countries/[id]/page.tsx
│   │   │   ├── customers/page.tsx    # Marketing page
│   │   │   ├── faq/page.tsx
│   │   │   ├── integrations/page.tsx
│   │   │   ├── pricing/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   ├── products/page.tsx     # Marketing page
│   │   │   ├── products/[id]/page.tsx
│   │   │   ├── request-demo/page.tsx
│   │   │   ├── resources/page.tsx
│   │   │   ├── reviews/page.tsx
│   │   │   ├── solutions/page.tsx
│   │   │   ├── solutions/[id]/page.tsx
│   │   │   └── terms/page.tsx
│   │   └── (app)/                    # Authenticated application
│   │       ├── layout.tsx            # App shell (sidebar + header)
│   │       ├── dashboard/page.tsx    # Business dashboard
│   │       ├── pos/page.tsx          # Point of Sale
│   │       ├── sales/page.tsx        # Sales transactions
│   │       ├── orders/page.tsx       # Orders
│   │       ├── returns/page.tsx      # Returns
│   │       ├── shifts/page.tsx       # Cash & shifts
│   │       ├── products/page.tsx     # Product catalog
│   │       ├── inventory/page.tsx    # Inventory management
│   │       ├── customers/page.tsx    # Customer management
│   │       ├── suppliers/page.tsx    # Supplier management
│   │       ├── purchasing/page.tsx   # Purchase orders
│   │       ├── accounting/page.tsx   # Chart of accounts
│   │       ├── invoices/page.tsx     # Invoices
│   │       ├── expenses/page.tsx     # Expenses
│   │       ├── receivables/page.tsx  # Accounts receivable
│   │       ├── payables/page.tsx     # Accounts payable
│   │       ├── analytics/page.tsx    # Business analytics
│   │       ├── reports/page.tsx      # Reports
│   │       ├── settings/page.tsx     # Settings
│   │       └── help/page.tsx         # Help center
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (48 primitives)
│   │   ├── marketing/                # Marketing-specific components
│   │   │   ├── nav.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── pricing-client.tsx
│   │   │   ├── contact-form.tsx
│   │   │   └── demo-form.tsx
│   │   ├── shared/                   # Reusable shared states
│   │   │   ├── loading-state.tsx
│   │   │   ├── error-state.tsx
│   │   │   ├── empty-state.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── pos/                      # POS-specific components (future)
│   │   ├── commerce/                 # Commerce-specific components (future)
│   │   ├── books/                    # Books-specific components (future)
│   │   ├── insights/                 # Insights-specific components (future)
│   │   └── settings/                 # Settings-specific components (future)
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.tsx               # Auth context + login/logout
│   │   ├── useTanStackQuery.tsx      # Query client + data hooks
│   │   ├── useSync.ts                # Offline sync hook
│   │   └── use-mobile.tsx            # Mobile breakpoint hook
│   ├── lib/                          # Pure helpers and config
│   │   ├── utils.ts                  # cn() helper
│   │   ├── api.ts                    # API function wrappers
│   │   └── query-keys.ts             # TanStack Query key factory
│   ├── providers/                    # React context providers
│   │   └── theme-provider.tsx        # next-themes wrapper
│   ├── config/                       # Static content/config
│   │   ├── navigation.ts
│   │   ├── products.ts
│   │   ├── pricing.ts
│   │   ├── solutions.ts
│   │   ├── countries.ts
│   │   ├── testimonials.ts
│   │   └── faq.ts
│   └── middleware.ts                 # Next.js middleware (auth guard)
├── public/
├── package.json
├── tsconfig.json
├── next.config.js
├── components.json                   # shadcn config
├── postcss.config.js
└── .eslintrc.json
```

## Route groups

- `(marketing)` — Public marketing pages. Wrapped with `MarketingLayout` (nav + footer).
- `(app)` — Authenticated application. Wrapped with `AppLayout` (sidebar + header).

Route groups do not affect URLs. `/products` stays `/products` whether it's in `(marketing)` or `(app)`.

## `src/` structure

- `src/app/` → Next.js routes and layouts
- `src/components/` → Presentational components
- `src/hooks/` → Shared React hooks
- `src/lib/` → Pure helpers and config
- `src/providers/` → React context providers
- `src/config/` → Static content and configuration

Do **not** create a second `app/` tree. All routes live under `src/app/`.

## Workspace packages (single source of truth)

Shared code lives in workspace packages, not in `src/`:

- `@soko/domain-types` — TypeScript interfaces
- `@soko/api-client` — HTTP client
- `@soko/offline` — Dexie schema
- `@soko/sync` — Sync engine
- `@soko/tax` — Tax calculations
- `@soko/payments` — Payment providers
- `@soko/accounting` — Accounting types
- `@soko/utils` — Utilities
- `@soko/validation` — Zod schemas

Removed duplicate local mirrors:
- `src/api-client/`
- `src/domain-types/`
- `src/offline/`
- `src/sync/`
- `src/tax/`
- `src/utils/`
- `src/validation/`
- `src/ui/`
- `packages/ui/` (stale package)
