<div align="center">

# Web

**React 19 SPA boilerplate with Vite, Tailwind CSS v4, shadcn/ui, and TanStack Query.**

[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4.svg)](https://tailwindcss.com)

</div>

## Features

- **shadcn/ui components**: Radix-based accessible components, icon library via `@remixicon/react`
- **Dark mode**: system-preference aware, togglable with `d`, persisted in `localStorage`
- **TanStack Query v5**: pre-configured `QueryClient` with 1-minute stale time and single retry
- **Tailwind CSS v4**: CSS-first — no config file, all design tokens live in `src/index.css`
- **Testing**: Vitest + jsdom + Testing Library, ready to run

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | React 19 |
| Language | TypeScript 6 |
| Bundler | Vite 8 |
| Styling | Tailwind CSS v4 + shadcn/ui (radix-vega) |
| Data fetching | TanStack Query v5 |
| Tests | Vitest 4 + Testing Library |
| Fonts | Nunito Sans (body), Geist (headings) |

## Quick Start

```bash
# From the monorepo root
npm install
npm run start:dev:web
# App available at http://localhost:5173
```

Or from `apps/web` directly:

```bash
npm install
npm run start:dev
```

## Development

```bash
npm run build            # Type-check + production build
npm run typecheck        # Type-check without emitting
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix + Prettier format
npm run prettier:format  # Prettier only (ts, tsx)
npm run test             # Run tests once
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report (v8)
npm run preview          # Preview production build locally
```

### Run a single test file

```bash
npx vitest run src/__tests__/App.spec.tsx
```

### Add a shadcn/ui component

```bash
npx shadcn@latest add <component-name>
# Components are placed in src/components/ui/
```

## Folder Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui generated components
│   └── theme-provider.tsx  # Dark/light mode context + keyboard shortcut
├── lib/
│   ├── query-client.ts  # TanStack QueryClient singleton
│   └── utils.ts         # cn() class merging utility
├── __tests__/           # Component and unit tests (*.spec.tsx)
├── test/
│   └── setup.ts         # Vitest setup (jest-dom matchers)
├── index.css            # Tailwind v4 imports + design tokens (@theme inline)
├── main.tsx             # Entry point — provider tree
└── App.tsx              # Root component
```

## Architecture

See [Technical Documentation](docs/TECHNICAL.md) for architecture details, component design decisions, and how to extend the project.