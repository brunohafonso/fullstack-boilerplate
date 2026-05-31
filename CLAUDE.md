# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

npm workspaces monorepo with two apps:
- `apps/api` — Express 5 REST API (Node.js 24+, TypeScript 6, Prisma 7, SQLite)
- `apps/web` — placeholder, not yet implemented

## Commands

All commands can be run from the root or from within each workspace.

### API (from root)

```bash
npm run dev:api              # Start API with hot-reload (tsx watch)
npm run test:unit:api        # Run unit tests
npm run test:integration:api # Run integration tests (pushes schema to test DB first)
npm run test:all:api         # Unit + integration
npm run lint:api             # Lint
npm run lint:fix:api         # Lint with auto-fix
```

### API (from apps/api)

```bash
npm run db:generate   # Generate Prisma client (required after schema changes)
npm run db:migrate    # Create and apply a migration
npm run db:push       # Push schema without creating a migration file
npm run db:studio     # Open Prisma Studio
```

### Run a single test file

```bash
# From apps/api — unit test
NODE_OPTIONS=--experimental-vm-modules npx jest src/modules/users/__tests__/service.spec.ts

# Integration test
dotenv -e .env.test -- sh -c 'NODE_OPTIONS=--experimental-vm-modules npx jest --config jest.integration.config.js src/modules/users/__tests__/service.test.ts --runInBand'
```

## API Architecture

The API follows a **modular, factory-based** structure:

```
src/
├── App.ts              # Express app class — wires middleware, DB, routes, shutdown
├── index.ts            # Entry point — instantiates App, registers signal handlers
├── config/             # Joi-validated environment variables (NODE_ENV, PORT, DATABASE_URL)
├── lib/prisma.ts       # Prisma client singleton (better-sqlite3 adapter)
├── middlewares/        # errorHandler, requestLogger
├── modules/
│   ├── healthcheck/    # GET /healthcheck
│   └── users/          # Full CRUD — router, controller, service, schemas, types, factory
└── shared/
    ├── errors/         # HttpError hierarchy: BadRequestError, NotFoundError, ValidationError, InternalServerError
    ├── validators/     # Joi wrapper that throws ValidationError
    ├── logger.ts       # Pino singleton
    └── types.ts        # ILogger and other shared interfaces
```

**Module pattern**: each domain module has `router.ts → controller.ts → service.ts`, wired by `factory.ts`. The factory creates the service, injects it into the controller, and returns the router. This keeps modules independently testable.

**Error handling**: services throw typed `HttpError` subclasses; `errorHandler` middleware maps them to HTTP responses. Non-operational errors (e.g. `InternalServerError`) are treated as unexpected and get a generic 500 response.

**Test split**:
- Unit tests (`*.spec.ts`) live in `__tests__/`, match `jest.config.js`, mock Prisma.
- Integration tests (`*.test.ts`) live in `__tests__/`, match `jest.integration.config.js`, run against a real SQLite DB defined in `.env.test`, always run with `--runInBand`.

## Prisma

- Schema: `apps/api/prisma/schema.prisma` — SQLite provider, client output to `src/generated/prisma`
- After any schema edit, run `npm run db:generate` to regenerate the client
- Integration tests use `.env.test`; the `test:integration` script calls `prisma db push` automatically before running tests

## Commits

Conventional Commits enforced via commitlint + husky. Format: `type(scope): description`.
Lint-staged runs ESLint and related unit tests on staged API files before each commit.

## Environment Files

- `.env.development` — local dev (gitignored, copy from `.env.example`)
- `.env.test` — integration test DB
- `.env.example` — template with required vars: `NODE_ENV`, `PORT`, `DATABASE_URL`
