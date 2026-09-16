# Component Library

## Component showcase

`/dev/components` (`src/app/dev/components/page.tsx`) is a dev-only route that renders every installed shadcn component for visual QA in light/dark/system modes.

## Installed components

### Navigation / Layout
- accordion, aspect-ratio, breadcrumb, collapsible, context-menu
- drawer, dropdown-menu, menubar, navigation-menu, pagination
- resizable, scroll-area, separator, sheet, sidebar, tabs

### Forms
- button, calendar, checkbox, combobox, form, input, input-otp
- label, radio-group, select, slider, switch, textarea, toggle, toggle-group

### Feedback
- alert, alert-dialog, badge, progress, skeleton, sonner, tooltip

### Data
- avatar, card, carousel, chart, table

### Overlay
- dialog, drawer, dropdown-menu, hover-card, popover, sheet, tooltip

### Search
- command

## Custom shared states

- `src/components/shared/loading-state.tsx`
- `src/components/shared/empty-state.tsx`
- `src/components/shared/error-state.tsx`
- `src/components/shared/theme-toggle.tsx`

All components use shadcn/ui primitives with Soko-OS design tokens.
