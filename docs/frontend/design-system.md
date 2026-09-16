# Soko-OS Frontend Design System

## Overview

Soko-OS uses a single unified design system across all frontend experiences:

- Marketing website
- Authentication
- Soko POS
- Dashboard
- Admin
- Inventory
- Purchasing
- Sales
- Payments
- Customers
- Reports
- Settings

All surfaces share one color system, one typography system, one shadow language, and one theme mechanism.

## Brand Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--main` | oklch(78.57% 0.1422 180.36) | oklch(71.47% 0.129261 180.4742) | Primary CTA, active navigation, key accents |
| `--background` | oklch(95.08% 0.0481 184.07) | oklch(22.65% 0.0236 198.49) | Page backgrounds |
| `--secondary-background` | oklch(100% 0 0) | oklch(23.93% 0 0) | Cards, panels, elevated surfaces |
| `--foreground` | oklch(0% 0 0) | oklch(92.49% 0 0) | Primary text |
| `--main-foreground` | oklch(0% 0 0) | oklch(0% 0 0) | Text on main color |
| `--border` | oklch(0% 0 0) | oklch(0% 0 0) | Neobrutalist borders |
| `--ring` | oklch(0% 0 0) | oklch(100% 0 0) | Focus rings |
| `--overlay` | oklch(0% 0 0 / 0.8) | oklch(0% 0 0 / 0.8) | Modal overlays |

## Semantic Status Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--success` | oklch(79% 0.17 142) | oklch(79% 0.17 142) | Success states |
| `--warning` | oklch(92% 0.19 95) | oklch(92% 0.19 95) | Warnings, highlights |
| `--destructive` | oklch(63% 0.2 27) | oklch(63% 0.2 27) | Errors, danger |
| `--info` | oklch(82% 0.1 190) | oklch(71% 0.1 190) | Informational |
| `--muted` | oklch(96% 0 0) | oklch(22.65% 0.0236 198.49) | Muted backgrounds |
| `--muted-foreground` | oklch(56% 0 0) | oklch(65% 0 0) | Muted text |

## Chart Colors

| Token | Light | Dark |
|-------|-------|------|
| `--chart-1` | #00D6BD | #00BDA7 |
| `--chart-2` | #0099FF | #008AE5 |
| `--chart-3` | #7A83FF | #7A83FF |
| `--chart-4` | #FF4D50 | #FF6669 |
| `--chart-5` | #FACC00 | #E0B700 |

## Typography

| Role | Weight | Usage |
|------|--------|-------|
| Body | 500 | All body text |
| Headings | 700 | h1-h6 |
| Labels | 700 | Form labels, small headings |
| Caption | 500 | Helper text, timestamps |
| Numeric/Financial | 700 | Monetary values, counts |

Font family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

## Shadows

Primary shadow: `4px 4px 0px 0px var(--border)`

Variants:
- Default: `shadow` → `4px 4px 0px 0px var(--border)`
- Hover: `hover:shadow-[6px_6px_0px_0px_var(--border)]`
- Small: `shadow-[3px_3px_0px_0px_var(--border)]`
- Pressed: `active:translate-x-0.5 active:translate-y-0.5`

Do NOT use soft/blurred shadows.

## Border Radius

Base radius: `0.5rem` (8px)

Use:
- `rounded-lg` for most components
- `rounded-xl` for cards
- `rounded-md` for small controls
- `rounded-full` only for badges/pills

## Spacing

Use Tailwind's default spacing scale. Marketing may use larger section spacing, but the underlying scale remains coherent.

## Theme Modes

- **Light**: Bright, clean, energetic pale teal background
- **Dark**: Deliberate dark teal, not pure black
- **System**: Respects OS preference, persisted in `localStorage` key `soko-theme`

## Global Theme Provider

One global `ThemeProvider` in `src/providers/theme-provider.tsx` wraps the entire app. Do NOT create per-area theme providers.

## Design Tokens in Tailwind

All tokens are defined in `src/app/globals.css` via `@theme` and CSS variables. Use semantic classes like:

- `bg-main`, `text-main-foreground`
- `bg-background`, `text-foreground`
- `bg-secondary-background`
- `border-border`, `ring-ring`
- `bg-success`, `text-success-foreground`
- `bg-warning`, `text-warning-foreground`
- `bg-destructive`, `text-destructive-foreground`
- `bg-info`, `text-info-foreground`
- `bg-muted`, `text-muted-foreground`

## Component Conventions

### Buttons
- Strong `border-2 border-black`
- Hard offset shadow
- Bold text
- `active:translate-x-0.5 active:translate-y-0.5` for pressed state
- Semantic color tokens only

### Cards
- `border-2 border-black`
- `shadow` (hard offset)
- `bg-secondary-background`
- Clear spacing and hierarchy

### Inputs
- `border-2 border-black`
- Clear focus ring
- Accessible labels
- Error and disabled states

### Tables
- Bold headings
- Clear borders
- Strong row separation

### Dialogs
- `border-2 border-black`
- `bg-secondary-background`
- Hard shadow

## Neobrutalism Principles

- Bold borders
- Hard offset shadows
- Strong hierarchy
- High contrast
- Chunky controls
- Distinct typography
- Tactile buttons
- Clear interaction states
- Intentional asymmetry

## Marketing vs Application

Marketing may use more expressive Neobrutalism. The application should be more restrained for operational usability. Both share the same palette, typography, borders, shadows, and radius.

## Developer Rules

When building any new screen:

1. Check for existing semantic token first
2. Check for existing shadcn component
3. Check for existing Neobrutalist component
4. Check for existing Soko-OS pattern
5. Only create something new when no suitable pattern exists

Do NOT invent new colors. Do NOT create competing design systems.

## Token Mapping (Legacy → Current)

| Legacy Token | Current Token |
|-------------|---------------|
| `bg-[#FFDE59]` | `bg-warning` |
| `bg-[#5CE1E6]` | `bg-info` |
| `bg-[#FF5757]` | `bg-destructive` |
| `bg-[#7ED957]` | `bg-success` |
| `text-green-600` | `text-success` |
| `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` | `shadow` |
| `bg-white` (cards) | `bg-secondary-background` |
| `bg-neutral-50` | `bg-muted` |
| `bg-neutral-100` | `bg-muted` |
| `text-neutral-600` | `text-muted-foreground` |

## Accessibility

- All interactive components support keyboard navigation
- Focus indicators use `ring-ring`
- ARIA labels where appropriate
- Contrast meets WCAG standards
- `prefers-reduced-motion` respected

## Files

| File | Purpose |
|------|---------|
| `src/app/globals.css` | Single source of truth for design tokens |
| `src/providers/theme-provider.tsx` | Global theme provider |
| `src/components/ui/*` | shadcn/ui styled with Soko-OS tokens |
| `src/components/shared/theme-toggle.tsx` | Shared theme switcher |
| `src/components/marketing/*` | Marketing-specific components |
| `docs/frontend/design-system.md` | This document |
