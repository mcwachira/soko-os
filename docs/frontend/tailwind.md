# Tailwind CSS

## Version

Tailwind CSS **v4.3.3** (latest stable compatible with Next.js 15).

## Why there is no `tailwind.config.js`

Tailwind v4 uses a **CSS-first configuration model**. Theme tokens, colors, and utilities are configured directly in CSS using `@import "tailwindcss"` and `@theme`. A `tailwind.config.js` / `tailwind.config.ts` is **not required** and is intentionally absent.

## Where Tailwind is configured

Primary configuration lives in:

```
apps/web/src/app/globals.css
```

Key sections:
- `@import "tailwindcss"` — brings in all default utilities
- `@import "tw-animate-css"` — animation utilities for shadcn
- `@theme { ... }` — maps CSS variables to Tailwind color utilities
- `:root` / `.dark` — design token values
- `@layer base` — global resets and defaults

## PostCSS

`apps/web/postcss.config.js`:

```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

The old `tailwindcss` PostCSS plugin is replaced by `@tailwindcss/postcss` in v4.

## How `@theme` works

The `@theme` block exposes CSS variables as Tailwind utilities:

```css
@theme {
  --color-background: oklch(var(--background));
  --color-foreground: oklch(var(--foreground));
  --radius: 0.5rem;
}
```

This makes `bg-background`, `text-foreground`, `rounded-lg`, etc. available.

## Dark mode

Dark mode is toggled by adding/removing the `.dark` class on `<html>`. The `ThemeProvider` in `src/providers/theme-provider.tsx` handles this.

## Custom colors

Soko-OS colors are exposed via CSS variables in `:root` and `.dark`, then mapped in `@theme`. To add a new token:

1. Define the CSS variable in `:root` and `.dark` in `globals.css`.
2. Add a `--color-*` entry in the `@theme` block.
3. Use the new utility class (e.g. `bg-newcolor`) in components.

## Migration from v3

- `@tailwind base` → `@import "tailwindcss"`
- `@tailwind components` → removed (included in import)
- `@tailwind utilities` → removed (included in import)
- `tailwind.config.js` theme colors → `@theme` block + CSS variables
- `tailwindcss` PostCSS plugin → `@tailwindcss/postcss`
