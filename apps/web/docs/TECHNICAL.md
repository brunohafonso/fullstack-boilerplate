# Technical Documentation

Detailed architecture, components, and data flows for the Web app.

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Provider Tree](#3-provider-tree)
4. [Styling System](#4-styling-system)
5. [Components](#5-components)
6. [Data Fetching](#6-data-fetching)
7. [Testing](#7-testing)
8. [Extending the System](#8-extending-the-system)

---

## 1. Overview

Single-page React application. The entry point (`src/main.tsx`) wraps the app in a provider tree and mounts it to `#root`. No router is configured yet — routing should be added as the app grows.

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React 19 + Vite 8 | Rendering and bundling |
| Language | TypeScript 6 | Type safety |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility CSS + accessible components |
| Data fetching | TanStack Query v5 | Server state management |
| Tests | Vitest 4 + Testing Library | Component and unit tests |

---

## 2. Architecture

```
┌─────────────────────────────────────────┐
│              src/main.tsx               │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │      QueryClientProvider         │   │
│  │  ┌────────────────────────────┐  │   │
│  │  │       ThemeProvider        │  │   │
│  │  │  ┌──────────────────────┐  │  │   │
│  │  │  │         App          │  │  │   │
│  │  │  └──────────────────────┘  │  │   │
│  │  └────────────────────────────┘  │   │
│  │      ReactQueryDevtools          │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

Path alias `@/` resolves to `src/` — always use it for imports.

---

## 3. Provider Tree

### ThemeProvider (`src/components/theme-provider.tsx`)

Manages dark/light mode. Applies `.dark` or `.light` class to `<html>`, reads system preference via `matchMedia`, and persists the choice in `localStorage` under the key `"theme"`.

**Behaviors:**
- Default theme: `"system"` (follows OS preference)
- Keyboard shortcut: press `d` to toggle between dark and light (ignored when focus is on editable elements)
- Cross-tab sync: listens to `StorageEvent` so theme changes propagate to other open tabs
- Transitions are disabled briefly during theme change to prevent flicker

**Hook:**

```tsx
import { useTheme } from "@/components/theme-provider"

const { theme, setTheme } = useTheme()
// theme: "dark" | "light" | "system"
// setTheme: (theme: "dark" | "light" | "system") => void
```

`useTheme` throws if called outside `ThemeProvider`.

### QueryClientProvider (`src/lib/query-client.ts`)

Pre-configured `QueryClient` singleton:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
})
```

Import `queryClient` directly when you need to imperatively invalidate or prefetch outside a component.

---

## 4. Styling System

### Tailwind CSS v4 — CSS-first configuration

No `tailwind.config.js`. All configuration lives in `src/index.css`:

- `@import "tailwindcss"` — loads the framework
- `@import "tw-animate-css"` — animation utilities
- `@import "shadcn/tailwind.css"` — shadcn token layer
- `:root` / `.dark` — CSS custom properties for all color tokens (OKLCH color space)
- `@theme inline` — maps CSS variables to Tailwind utilities (e.g. `--color-primary` → `bg-primary`)
- `@custom-variant dark` — configures `dark:` variant to target `.dark` class on ancestors

**Design tokens** (defined in `:root` / `.dark`):

| Token | Purpose |
|-------|---------|
| `--background` / `--foreground` | Page background and default text |
| `--primary` / `--primary-foreground` | Brand color + text on brand |
| `--secondary`, `--muted`, `--accent` | Supporting surfaces |
| `--destructive` | Error / danger actions |
| `--border`, `--input`, `--ring` | Form and focus styles |
| `--radius` | Base border radius (0.625rem); variants `--radius-sm` through `--radius-4xl` |
| `--sidebar-*` | Sidebar-specific tokens |
| `--font-sans` | `Nunito Sans Variable` (body) |
| `--font-heading` | `Geist Variable` (headings) |

### cn() utility (`src/lib/utils.ts`)

Merges Tailwind classes using `clsx` + `tailwind-merge`. Use it for conditional class composition:

```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", isActive && "active-class", className)} />
```

### shadcn/ui configuration (`components.json`)

| Setting | Value |
|---------|-------|
| Style | `radix-vega` |
| Base color | `neutral` |
| CSS variables | enabled |
| Icon library | `remixicon` (`@remixicon/react`) |
| Component alias | `@/components/ui` |
| Lib alias | `@/lib` |
| Hooks alias | `@/hooks` |

Add components with `npx shadcn@latest add <name>`. Generated files land in `src/components/ui/`.

---

## 5. Components

### `src/components/ui/`

Auto-generated shadcn/ui components. Treat these as owned code — edit them directly to customize behavior or styling. Do not wrap or re-export without modification.

### `src/components/theme-provider.tsx`

Custom implementation (not from shadcn). Owns the full theme lifecycle: read → apply → persist → sync. See [Provider Tree](#3-provider-tree) for the API.

---

## 6. Data Fetching

TanStack Query v5 is the only data-fetching layer. Use `useQuery` and `useMutation` inside components; use `queryClient` directly for prefetching, invalidation, or seeding the cache server-side.

```tsx
import { useQuery } from "@tanstack/react-query"

const { data, isPending, error } = useQuery({
  queryKey: ["users"],
  queryFn: () => fetch("/api/users").then(r => r.json()),
})
```

`ReactQueryDevtools` is mounted in development (initialIsOpen: false).

---

## 7. Testing

| Tool | Role |
|------|------|
| Vitest 4 | Test runner (globals enabled) |
| jsdom | Browser environment simulation |
| Testing Library | Component rendering + queries |
| `@testing-library/jest-dom` | Custom DOM matchers (loaded in `src/test/setup.ts`) |
| `@vitest/coverage-v8` | Coverage via V8 |

**Conventions:**
- Test files: `src/__tests__/*.spec.tsx`
- Setup file: `src/test/setup.ts`
- Coverage excludes `src/test/**` and `src/main.tsx`

Run a single file:

```bash
npx vitest run src/__tests__/App.spec.tsx
```

---

## 8. Extending the System

### Adding a new page / route

A router is not yet installed. When adding routing:
1. Install `react-router` or `@tanstack/react-router`
2. Wrap the provider tree in a `RouterProvider` in `src/main.tsx`
3. Create page components in `src/pages/`

### Adding a new shadcn/ui component

```bash
npx shadcn@latest add <component-name>
# File lands at src/components/ui/<component-name>.tsx
```

Icons come from `@remixicon/react` — match what shadcn uses for consistency:

```tsx
import { RiArrowRightLine } from "@remixicon/react"
```

### Adding a new hook

Create `src/hooks/<name>.ts`. Use the `@/hooks` alias to import:

```tsx
import { useMyHook } from "@/hooks/use-my-hook"
```

### Adding a new data query

1. Create a query function in `src/lib/` or co-locate it with the feature
2. Define a stable `queryKey` (array, from general → specific)
3. Use `useQuery` or `useMutation` in the component
4. For shared cache operations, import `queryClient` from `@/lib/query-client`

### Modifying design tokens

Edit the `:root` and `.dark` blocks in `src/index.css`. Tokens automatically become Tailwind utilities via `@theme inline`. Use OKLCH values to stay consistent with the existing palette.
