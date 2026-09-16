# Soko-OS UI Architecture

## Product Architecture

Soko-OS is organized into four primary product areas. Platform capabilities (tax, payments, sync, integrations) live within these areas rather than as separate top-level products.

```text
Soko-OS
│
├── Marketing
│   ├── Homepage
│   ├── Products
│   ├── Pricing
│   ├── Solutions
│   ├── Countries
│   ├── Customers
│   ├── Integrations
│   ├── Resources
│   └── Legal
│
├── Authentication
│   └── Login
│
└── Application
    │
    ├── Dashboard
    │
    ├── Soko POS
    │   ├── POS Checkout
    │   ├── Sales
    │   ├── Orders
    │   ├── Returns
    │   └── Cash & Shifts
    │
    ├── Soko Commerce
    │   ├── Products
    │   ├── Inventory
    │   ├── Customers
    │   ├── Suppliers
    │   └── Purchasing
    │
    ├── Soko Books
    │   ├── Accounting
    │   ├── Invoices
    │   ├── Expenses
    │   ├── Receivables
    │   └── Payables
    │
    ├── Soko Insights
    │   ├── Analytics
    │   └── Reports
    │
    └── System
        ├── Settings
        ├── Integrations
        ├── Team & Permissions
        ├── Locations
        └── Devices
```

## Route Architecture

### Marketing Routes (`(marketing)` route group)

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/about` | About Soko-OS |
| `/blog` | Blog posts |
| `/compliance` | Compliance information |
| `/contact` | Contact form |
| `/countries` | Country pages |
| `/countries/[id]` | Individual country page |
| `/customers` | Marketing customer stories |
| `/faq` | Frequently asked questions |
| `/integrations` | Integration catalog |
| `/pricing` | Pricing tiers |
| `/privacy` | Privacy policy |
| `/products` | Marketing product overview |
| `/products/[id]` | Individual product page |
| `/request-demo` | Demo request form |
| `/resources` | Resource hub |
| `/reviews` | Customer reviews |
| `/solutions` | Industry solutions |
| `/solutions/[id]` | Individual solution |
| `/terms` | Terms of service |
| `/login` | Authentication |

### Application Routes (`(app)` route group)

| Route | Product Area | Purpose |
|-------|--------------|---------|
| `/dashboard` | — | Business overview |
| `/pos` | Soko POS | Point of sale checkout |
| `/sales` | Soko POS | Sales transactions |
| `/orders` | Soko POS | Order management |
| `/returns` | Soko POS | Returns processing |
| `/shifts` | Soko POS | Cash drawer & shifts |
| `/products` | Soko Commerce | Product catalog |
| `/inventory` | Soko Commerce | Inventory tracking |
| `/customers` | Soko Commerce | Customer management |
| `/suppliers` | Soko Commerce | Supplier management |
| `/purchasing` | Soko Commerce | Purchase orders |
| `/accounting` | Soko Books | Chart of accounts |
| `/invoices` | Soko Books | Invoice management |
| `/expenses` | Soko Books | Expense tracking |
| `/receivables` | Soko Books | Accounts receivable |
| `/payables` | Soko Books | Accounts payable |
| `/analytics` | Soko Insights | Business analytics |
| `/reports` | Soko Insights | Reports |
| `/settings` | System | Business settings |
| `/help` | System | Help center |

## Navigation Architecture

### Marketing Navigation

- Sticky header with logo
- Dropdown menus for Products, Solutions, Countries, Resources
- Theme toggle (light/dark/system) via shared `ThemeToggle` component
- CTA buttons (Customers, Request Demo)
- Mobile hamburger menu
- Footer with link columns

### Application Navigation

- Persistent sidebar with product area groupings
- Collapsible on mobile via shadcn sidebar
- Header with sidebar trigger, theme toggle, and placeholders for search, business selector, and user menu
- Active state indicators based on pathname
- Keyboard shortcut support for sidebar toggle

### Navigation Hierarchy

```
Overview
SELL
  POS
  Sales
  Orders
  Returns
  Cash & Shifts
COMMERCE
  Products
  Inventory
  Customers
  Suppliers
  Purchasing
BOOKS
  Accounting
  Invoices
  Expenses
  Receivables
  Payables
INSIGHTS
  Analytics
  Reports
SYSTEM
  Settings
  Help
```

## Component Architecture

### Shared UI Primitives (`components/ui/`)

Single source of truth for UI components. Built on shadcn/ui with Soko-OS design tokens.

- `button.tsx` — Primary interaction element
- `card.tsx` — Content containers
- `badge.tsx` — Status indicators
- `input.tsx` — Form inputs
- `form.tsx` — React Hook Form integration
- `table.tsx` — Data tables
- `dialog.tsx` — Modal dialogs
- `sidebar.tsx` — Application sidebar
- `progress.tsx` — Progress indicators
- `chart.tsx` — Recharts wrapper

### Shared States (`components/shared/`)

Reusable state components used across marketing and app:

- `loading-state.tsx` — Loading spinners/skeletons
- `error-state.tsx` — Error displays with retry
- `empty-state.tsx` — Empty state guidance
- `theme-toggle.tsx` — Theme switcher (light/dark/system)

### Marketing Components (`components/marketing/`)

- `nav.tsx` — Marketing header navigation
- `footer.tsx` — Marketing footer
- `pricing-client.tsx` — Interactive pricing component
- `contact-form.tsx` — Contact form
- `demo-form.tsx` — Demo request form

### Feature Components

Feature-specific components live in dedicated directories:

- `components/pos/` — POS-specific components
- `components/commerce/` — Commerce-specific components
- `components/books/` — Books-specific components
- `components/insights/` — Insights-specific components
- `components/settings/` — Settings-specific components

### Removed Components

- `src/ui/index.tsx` — Removed stale duplicate with hardcoded colors
- `packages/ui/` — Removed stale package with hardcoded colors

## Design System

### Colors

- **Primary**: `--main` (teal) for CTAs, active states, key accents
- **Background**: `--background` (pale teal in light, dark teal in dark)
- **Secondary Background**: `--secondary-background` (white in light, dark gray in dark)
- **Foreground**: `--foreground` for primary text
- **Border**: `--border` (black) for Neobrutalist borders
- **Semantic**: `success`, `warning`, `destructive`, `info`, `muted`

### Typography

- Body: 500 weight
- Headings: 700 weight
- Font: system-ui stack

### Shadows

- Primary: `4px 4px 0px 0px var(--border)` (hard offset)
- Hover: `6px 6px 0px 0px var(--border)`
- No soft/blurred shadows

### Border Radius

- Base: `0.5rem` (8px)
- Cards: `rounded-xl`
- Buttons: `rounded-lg`
- Small controls: `rounded-md`

### Theme Modes

- Light mode: Bright, clean, energetic
- Dark mode: Deliberate dark teal, not pure black
- System mode: Respects OS preference, persisted via `next-themes`

## Responsive Architecture

### Breakpoints

- Mobile: < 768px — Bottom nav or hamburger, stacked layouts
- Tablet: 768px - 1024px — Collapsible sidebar, responsive tables
- Desktop: > 1024px — Persistent sidebar, multi-column layouts
- Wide: > 1536px — Max-width containers, additional columns

### POS Specific

- Large touch targets (minimum 44px)
- High contrast for readability
- Minimal navigation
- Full-width checkout flow
- Tablet and touchscreen optimized

## State Management

- **Server State**: TanStack Query v5
- **Auth**: React Context (`useAuth`) with cookie + localStorage persistence
- **Offline**: Dexie IndexedDB via workspace package `@soko/offline`
- **No global state library** (Redux/Zustand not used)

## API Architecture

- Workspace package `@soko/api-client` — `SokoApiClient` class with typed methods
- `lib/api.ts` — Functional wrappers for API calls
- `hooks/useTanStackQuery.tsx` — React Query hooks
- All hooks require auth token from `useAuth`

## Adding New Features

1. Determine product area (POS, Commerce, Books, Insights, System)
2. Add route in appropriate `(app)` subdirectory
3. Use `AppLayout` wrapper for authenticated pages
4. Use shared UI components from `components/ui/`
5. Use semantic design tokens, not hardcoded colors
6. Follow existing page patterns (list, detail, create, edit)
7. Add TanStack Query hooks for data fetching
8. Document in this architecture map

## Verification

| Check | Status |
|-------|--------|
| TypeScript | PASS |
| Routes | PASS — Route groups established |
| Design tokens | PASS — Single source of truth |
| Component imports | PASS — Standardized on shadcn/ui |
| API consistency | PASS — Workspace packages used |
| Auth | PASS — Login page + middleware created |
| Theme | PASS — Shared ThemeToggle component |

## Remaining Issues

### Completed
- [x] Removed duplicate local package mirrors in `src/`
- [x] Removed stale `src/ui/` and `packages/ui/`
- [x] Standardized all imports on workspace packages
- [x] Consolidated theme management into shared `ThemeToggle`
- [x] Created auth login page
- [x] Created auth middleware for protected routes
- [x] Created feature component directories
- [x] Organized app routes by product area
- [x] Established app shell with sidebar navigation

### Needs Backend
- [ ] Real API endpoints for products, customers, inventory, etc.
- [ ] Business/branch context API
- [ ] Real data for dashboard, charts, tables
- [ ] Permission-based navigation visibility

### Future Enhancement
- [ ] Mobile bottom navigation for POS
- [ ] Command palette (`⌘K`) for global search
- [ ] Business/branch selector in app header
- [ ] User menu with preferences
- [ ] Notification system
- [ ] Real-time sync status indicator
- [ ] Offline mode UI
- [ ] Keyboard shortcuts for POS
- [ ] Barcode scanner integration UI
- [ ] Receipt printing UI
- [ ] Tax configuration UI
- [ ] Integration configuration UI
