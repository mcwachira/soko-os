# shadcn/ui

## How it was initialized

shadcn was initialized with:

```bash
pnpm dlx shadcn@latest init
```

Configuration:
- **Style**: New York
- **RSC**: false (Client Components)
- **CSS variables**: true
- **Base color**: slate
- **Tailwind config**: none (CSS-first v4)
- **CSS path**: `src/app/globals.css`
- **Components alias**: `@/components`
- **Utils alias**: `@/lib/utils`

## Where components live

```
apps/web/src/components/ui/
```

Each component is a standalone `.tsx` file.

## How to add another component

```bash
pnpm dlx shadcn@latest add <component-name>
```

Example:
```bash
pnpm dlx shadcn@latest add hover-card
```

## How aliases work

`components.json` aliases:
```json
{
  "components": "@/components",
  "utils": "@/lib/utils",
  "ui": "@/components/ui",
  "lib": "@/lib",
  "hooks": "@/hooks"
}
```

These are resolved by TypeScript paths in `tsconfig.json` and webpack aliases in `next.config.js`.

## How CSS variables work

shadcn components use Tailwind utility classes that map to CSS variables:

```tsx
className="bg-background text-foreground border-border"
```

These resolve to the Soko-OS design tokens defined in `globals.css`.

## How to customize components

Edit files directly under `src/components/ui/`. Do not edit files inside `node_modules`.

## Light/dark mode

Components automatically respect the `.dark` class on `<html>`. The `ThemeProvider` toggles this class based on user preference.
