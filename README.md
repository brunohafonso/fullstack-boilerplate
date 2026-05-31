<div align="center">

# fullstack-boilerplate

**Production-ready fullstack monorepo — Express 5 API + (web app coming soon)**

[![Node.js 24+](https://img.shields.io/badge/node-24+-339933.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-6-3178C6.svg)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/prisma-7-2D3748.svg)](https://www.prisma.io)
[![License](https://img.shields.io/badge/license-ISC-green.svg)]()

</div>

## Overview

npm workspaces monorepo with a modular, factory-based Express 5 REST API backed by Prisma 7 + SQLite. The web app workspace is a placeholder pending implementation.

## Apps

| App | Description | Docs |
|-----|-------------|------|
| `apps/api` | Express 5 REST API — users CRUD, Pino logging, Joi validation, graceful shutdown | [README](apps/api/README.md) |
| `apps/web` | Frontend app — not yet implemented | — |

## Requirements

- Node.js 24+
- npm 10+

## Getting Started

```bash
# Install all workspace dependencies
npm install

# Set up the API environment
cp apps/api/.env.example apps/api/.env.development
# Edit apps/api/.env.development and fill in PORT and DATABASE_URL

# Generate Prisma client and push the schema
npm run db:generate --workspace=apps/api
npm run db:push --workspace=apps/api

# Start the API
npm run dev:api
# → http://localhost:3001
```

## Commands

All commands are run from the **repo root**.

### API

| Command | Description |
|---------|-------------|
| `npm run dev:api` | Start API with hot-reload |
| `npm run build:api` | Compile TypeScript to `dist/` |
| `npm run test:unit:api` | Run unit tests |
| `npm run test:integration:api` | Run integration tests against a real SQLite DB |
| `npm run test:all:api` | Unit + integration |
| `npm run lint:api` | Lint |
| `npm run lint:fix:api` | Lint with auto-fix |

### Web

| Command | Description |
|---------|-------------|
| `npm run dev:web` | Start web app dev server |
| `npm run test:web` | Run web tests |

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
│   ├── api/          # Express 5 REST API
│   └── web/          # Frontend (placeholder)
├── .husky/           # Git hooks
├── commitlint.config.js
└── package.json      # Root workspace manifest
```
