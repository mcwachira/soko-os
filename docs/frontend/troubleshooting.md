# Frontend Troubleshooting

## pnpm install fails with EACCES on `.pnpm`

**Symptom:** `EACCES: permission denied, mkdir '.pnpm/@next+swc-...'`

**Cause:** The project's `node_modules/.pnpm` directory is owned by `root` (e.g. from a previous `sudo pnpm install` or Docker run as root).

**Fix:**
```bash
sudo chown -R $USER:$USER node_modules/.pnpm
pnpm install
```

Alternatively, run all installs inside a container as a non-root user.

## Build fails with `Cannot find module '@tailwindcss/postcss'`

**Cause:** Tailwind v4 requires `@tailwindcss/postcss` as the PostCSS plugin.

**Fix:**
```bash
pnpm add -D @tailwindcss/postcss
```

## ESLint flat config fails with `Package subpath './legacy' is not defined`

**Cause:** `@eslint/eslintrc` v2 removed the `legacy` subpath.

**Fix:** Use `.eslintrc.json` (legacy config) or migrate to `eslint-config-next` flat config.

## `Tooltip must be used within TooltipProvider`

**Cause:** Radix Tooltip requires a `<TooltipProvider>` ancestor.

**Fix:** Wrap tooltip usage in `<TooltipProvider>` from `@/components/ui/tooltip`.

## Port 3000/3001 already in use

**Fix:**
```bash
# Find process
lsof -ti:3000
# Kill
kill -9 $(lsof -ti:3000)
```

## Tailwind classes not applying

- Ensure `globals.css` is imported in `layout.tsx`.
- Verify `@theme` block exposes the utility.
- Check that the CSS variable exists in `:root` or `.dark`.

## TypeScript `paths` not resolving

- Verify `tsconfig.json` `paths` matches `next.config.js` webpack aliases.
- Restart TS server in IDE after config changes.
