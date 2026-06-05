# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### From monorepo root

```bash
npm run start:dev:web    # Start dev server
npm run test:web         # Run tests once
```

### From apps/web

```bash
npm run start:dev        # Start dev server (Vite)
npm run build            # Type-check + Vite build
npm run typecheck        # Type-check without emitting
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix + Prettier format
npm run prettier:format  # Prettier only (ts, tsx)
npm run test             # Run tests once (Vitest)
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run preview          # Preview production build locally
```

### Run a single test file

```bash
npx vitest run src/__tests__/App.spec.tsx
```

### Add a shadcn/ui component

```bash
npx shadcn@latest add <component-name>
```

Components are placed in `src/components/ui/`.

## Architecture

React 19 + Vite 8 + TypeScript 6 SPA. Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin — no `tailwind.config.js`; all theme tokens live in `src/index.css` under `@theme inline`).

**Provider tree** (`src/main.tsx`):

```
QueryClientProvider (TanStack Query)
  └── ThemeProvider
        └── App
ReactQueryDevtools
```

**Key conventions:**

- Path alias `@/` maps to `src/` — always use it for imports.
- shadcn/ui style is `radix-vega`; icon library is `remixicon` (`@remixicon/react`). When adding icons, import from there.
- `cn()` utility (`src/lib/utils.ts`) merges Tailwind classes — use it for conditional class composition.
- Theme is stored in `localStorage` under the key `"theme"`. `ThemeProvider` (`src/components/theme-provider.tsx`) applies `.dark` / `.light` class to `<html>` and exposes `useTheme()`. Press `d` to toggle dark mode.
- `queryClient` singleton lives in `src/lib/query-client.ts` (staleTime: 1 min, retry: 1). Import it when configuring queries outside React components.

**Tests** use Vitest + jsdom + Testing Library. Setup file is `src/test/setup.ts` (imports `@testing-library/jest-dom`). Test files follow `*.spec.tsx` naming inside `src/__tests__/`.

**Fonts:** `Nunito Sans Variable` (`--font-sans`, body) and `Geist Variable` (`--font-heading`, headings), both imported from `@fontsource-variable/*`.