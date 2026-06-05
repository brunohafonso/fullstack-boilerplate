<div align="center">

# fullstack-boilerplate

**Production-ready fullstack monorepo — Express 5 API + React 19 SPA**

[![Node.js 24+](https://img.shields.io/badge/node-24+-339933.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-6-3178C6.svg)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/prisma-7-2D3748.svg)](https://www.prisma.io)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vite.dev)
[![License](https://img.shields.io/badge/license-ISC-green.svg)]()

</div>

## Overview

npm workspaces monorepo with a modular, factory-based Express 5 REST API backed by Prisma 7 + SQLite, and a React 19 SPA with Tailwind CSS v4, shadcn/ui, and TanStack Query.

## Apps

| App | Description | Docs |
|-----|-------------|------|
| `apps/api` | Express 5 REST API — users CRUD, Pino logging, Joi validation, graceful shutdown | [README](apps/api/README.md) |
| `apps/web` | React 19 SPA — Vite, Tailwind CSS v4, shadcn/ui, TanStack Query, dark mode | [README](apps/web/README.md) |

## Requirements

- Node.js 24+
- npm 10+

## Getting Started

```bash
# Install all workspace dependencies
npm install
```

### API

```bash
# Set up the environment
cp apps/api/.env.example apps/api/.env.development
# Edit apps/api/.env.development and fill in PORT and DATABASE_URL

# Generate Prisma client and push the schema
npm run db:generate --workspace=apps/api
npm run db:push --workspace=apps/api

# Start the API
npm run start:dev:api
# → http://localhost:3001
```

### Web

```bash
npm run start:dev:web
# → http://localhost:5173
```

## Commands

All commands are run from the **repo root**.

### API

| Command | Description |
|---------|-------------|
| `npm run start:dev:api` | Start API with hot-reload |
| `npm run build:api` | Compile TypeScript to `dist/` |
| `npm run test:unit:api` | Run unit tests |
| `npm run test:integration:api` | Run integration tests against a real SQLite DB |
| `npm run test:all:api` | Unit + integration |
| `npm run lint:api` | Lint |
| `npm run lint:fix:api` | Lint with auto-fix |

### Web

| Command | Description |
|---------|-------------|
| `npm run start:dev:web` | Start Vite dev server |
| `npm run build:web` | Type-check + production build |
| `npm run typecheck:web` | Type-check without emitting |
| `npm run lint:web` | Lint |
| `npm run lint:fix:web` | Lint with auto-fix |
| `npm run format:web` | Format with Prettier |
| `npm run test:web` | Run tests once (Vitest) |
| `npm run test:coverage:web` | Run tests with coverage report |

## Tooling

| Tool | Purpose |
|------|---------|
| Husky + commitlint | Conventional Commits enforcement |
| lint-staged | ESLint + related unit tests on staged files before commit |
| Prettier | Code formatting |

## Commit Convention

Follows [Conventional Commits](https://www.conventionalcommits.org/). Format: `type(scope): description`.

Examples: `feat(users): add pagination`, `fix(auth): handle expired tokens`, `chore(deps): bump prisma to 7.9`.

## Project Structure

```
fullstack-boilerplate/
├── apps/
│   ├── api/          # Express 5 REST API (Prisma, SQLite, modular factory pattern)
│   └── web/          # React 19 SPA (Vite, Tailwind v4, shadcn/ui, TanStack Query)
├── .husky/           # Git hooks
├── commitlint.config.js
└── package.json      # Root workspace manifest
```
