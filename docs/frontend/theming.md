# Theming

For the complete design system including colors, typography, components, and usage rules, see [design-system.md](design-system.md).

## Overview

Soko-OS uses CSS custom properties (variables) for all design tokens. Tailwind v4 maps these variables to utility classes via the `@theme` block.

## Design tokens

### Light mode (`:root`)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(95.08% 0.0481 184.07)` | Page backgrounds |
| `--secondary-background` | `oklch(100% 0 0)` | Cards, panels, elevated surfaces |
| `--foreground` | `oklch(0% 0 0)` | Primary text |
| `--main-foreground` | `oklch(0% 0 0)` | Text on main color |
| `--main` | `oklch(78.57% 0.1422 180.36)` | Primary CTA, active nav, accents |
| `--border` | `oklch(0% 0 0)` | Neobrutalist borders |
| `--ring` | `oklch(0% 0 0)` | Focus rings |
| `--overlay` | `oklch(0% 0 0 / 0.8)` | Modal overlays |
| `--success` | `oklch(79% 0.17 142)` | Success states |
| `--warning` | `oklch(92% 0.19 95)` | Warnings, highlights |
| `--destructive` | `oklch(63% 0.2 27)` | Errors, danger |
| `--info` | `oklch(82% 0.1 190)` | Informational |
| `--muted` | `oklch(96% 0 0)` | Muted backgrounds |
| `--muted-foreground` | `oklch(56% 0 0)` | Muted text |
| `--shadow` | `4px 4px 0px 0px var(--border)` | Hard offset shadow |
| `--radius` | `0.5rem` | Base border radius |

### Dark mode (`.dark`)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `oklch(22.65% 0.0236 198.49)` | Page backgrounds |
| `--secondary-background` | `oklch(23.93% 0 0)` | Cards, panels, elevated surfaces |
| `--foreground` | `oklch(92.49% 0 0)` | Primary text |
| `--main-foreground` | `oklch(0% 0 0)` | Text on main color |
| `--main` | `oklch(71.47% 0.129261 180.4742)` | Primary CTA, active nav, accents |
| `--border` | `oklch(0% 0 0)` | Neobrutalist borders |
| `--ring` | `oklch(100% 0 0)` | Focus rings |
| `--overlay` | `oklch(0% 0 0 / 0.8)` | Modal overlays |
| `--success` | `oklch(79% 0.17 142)` | Success states |
| `--warning` | `oklch(92% 0.19 95)` | Warnings, highlights |
| `--destructive` | `oklch(63% 0.2 27)` | Errors, danger |
| `--info` | `oklch(71% 0.1 190)` | Informational |
| `--muted` | `oklch(22.65% 0.0236 198.49)` | Muted backgrounds |
| `--muted-foreground` | `oklch(65% 0 0)` | Muted text |
| `--shadow` | `4px 4px 0px 0px var(--border)` | Hard offset shadow |
| `--radius` | `0.5rem` | Base border radius |

## Tailwind utilities

Mapped in `globals.css` `@theme` block:
- `bg-background`, `text-foreground`
- `bg-secondary-background`
- `bg-main`, `text-main-foreground`
- `border-border`, `ring-ring`
- `bg-success`, `text-success-foreground`
- `bg-warning`, `text-warning-foreground`
- `bg-destructive`, `text-destructive-foreground`
- `bg-info`, `text-info-foreground`
- `bg-muted`, `text-muted-foreground`
- `text-chart-1` through `text-chart-5`

## Theme provider

`src/providers/theme-provider.tsx` handles:
- `light` / `dark` / `system`
- Persistence to `localStorage` (`soko-theme`)
- Class toggle on `<html>`
- Hydration safety (`suppressHydrationWarning`)

Usage in `layout.tsx`:

```tsx
<ThemeProvider defaultTheme="system" storageKey="soko-theme">
  {children}
</ThemeProvider>
```

## System theme

When `theme` is `"system"`, the provider reads `prefers-color-scheme: dark` from the OS. On refresh, the resolved theme is applied immediately to avoid flash.

## Migration Notes

Legacy hardcoded colors have been replaced with semantic tokens:

| Legacy | Current |
|--------|---------|
| `#FFDE59` | `bg-warning` |
| `#5CE1E6` | `bg-info` |
| `#FF5757` | `bg-destructive` |
| `#7ED957` | `bg-success` |
| `text-green-600` | `text-success` |
| `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` | `shadow` |
| `bg-white` (cards) | `bg-secondary-background` |
| `bg-neutral-50` | `bg-muted` |
| `text-neutral-600` | `text-muted-foreground` |

Do NOT reintroduce these legacy patterns.
