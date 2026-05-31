<div align="center">

# API

**RESTful HTTP API built with Express and Prisma — part of the fullstack-boilerplate monorepo.**

[![Node.js 24+](https://img.shields.io/badge/node-24+-339933.svg)](https://nodejs.org)
[![Express 5](https://img.shields.io/badge/express-5-000000.svg)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/typescript-6-3178C6.svg)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/prisma-7-2D3748.svg)](https://www.prisma.io)
[![License](https://img.shields.io/badge/license-ISC-green.svg)]()

</div>

## Features

- **Modular architecture**: each domain is a self-contained module with its own router, controller, service, and types
- **Request validation**: Joi schemas validate all incoming payloads and path parameters before they reach business logic
- **Structured logging**: Pino-based logger with request-level tracing via middleware
- **Error hierarchy**: typed HTTP errors (`BadRequestError`, `NotFoundError`, `ValidationError`) map directly to HTTP status codes
- **Graceful shutdown**: handles `SIGINT`/`SIGTERM`/`SIGQUIT` — closes the HTTP server and disconnects the database cleanly
- **Unit + integration tests**: Jest unit tests run against mocks; integration tests run against a real SQLite database

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 24+ |
| Framework | Express 5 |
| Language | TypeScript 6 |
| ORM | Prisma 7 |
| Database | SQLite (via `better-sqlite3`) |
| Validation | Joi 18 |
| Logging | Pino 10 |
| Security | Helmet 8 |
| Testing | Jest 30 + Supertest |

## Quick Start

```bash
cd apps/api
cp .env.example .env
npm install
npm run db:generate && npm run db:push
npm run start:dev
# API available at http://localhost:3001
```

See [docs/SETUP.md](docs/SETUP.md) for a complete first-time setup guide.

## Configuration

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `NODE_ENV` | Yes | — | Runtime environment (`development`, `test`, `production`) |
| `PORT` | Yes | — | Port the HTTP server listens on |
| `DATABASE_URL` | Yes | — | SQLite file path (e.g. `file:./dev.db`) |

## API Endpoints

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/healthcheck` | Returns app status and database connectivity |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get a user by ID |
| `POST` | `/users` | Create a user |
| `PATCH` | `/users/:id` | Update a user |
| `DELETE` | `/users/:id` | Delete a user |

See [docs/API.md](docs/API.md) for full request/response schemas.

## Architecture

```
┌────────────────────────────────────────────┐
│                  Express App               │
│                                            │
│  Helmet  ──  CORS  ──  RequestLogger       │
│                                            │
│  ┌──────────────┐   ┌──────────────────┐   │
│  │  /healthcheck│   │     /users       │   │
│  │  Controller  │   │   Controller     │   │
│  │  Service     │   │   Service        │   │
│  └──────┬───────┘   └────────┬─────────┘   │
│         │                   │              │
│         └──────────┬─────────┘             │
│                    │                       │
│              ┌─────▼──────┐                │
│              │   Prisma   │                │
│              └─────┬──────┘                │
│                    │                       │
└────────────────────┼───────────────────────┘
                     │
               ┌─────▼──────┐
               │   SQLite   │
               └────────────┘
```

## Folder Structure

```
apps/api/
├── prisma/
│   └── schema.prisma         # Database schema
├── src/
│   ├── config/               # Environment variable validation
│   ├── lib/
│   │   └── prisma.ts         # Prisma client singleton
│   ├── middlewares/          # Express middleware (error handler, request logger)
│   ├── modules/
│   │   ├── healthcheck/      # Health check module
│   │   └── users/            # Users CRUD module
│   └── shared/
│       ├── errors/           # HTTP error classes
│       ├── logger.ts         # Pino logger singleton
│       ├── types.ts          # Shared interfaces and enums
│       └── validators/       # Joi schema validator wrapper
├── .env.example              # Environment variable template
├── jest.config.js            # Unit test config
├── jest.integration.config.js# Integration test config
└── package.json
```

## Development

```bash
# Start with hot-reload
npm run start:dev

# Run unit tests
npm run test:unit

# Run integration tests (uses .env.test)
npm run test:integration

# Run all tests
npm run test:all

# Build (compile TypeScript to dist/)
npm run build

# Lint
npm run lint
npm run lint:fix

# Prisma operations
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Create and apply migrations
npm run db:push        # Push schema without creating migrations
npm run db:studio      # Open Prisma Studio
```

## Troubleshooting

**Problem**: `Missing required environment variables: PORT, NODE_ENV, DATABASE_URL`
**Solution**: Copy `.env.example` to `.env` and fill in all required values.

**Problem**: `TypeError: Cannot find module '../../generated/prisma'`
**Solution**: Run `npm run db:generate` to regenerate the Prisma client.

**Problem**: Integration tests fail with database errors
**Solution**: The integration tests use `.env.test`. Make sure `DATABASE_URL` is set there and run `npm run test:integration` (it pushes the schema automatically before tests).

**Problem**: `better-sqlite3` native binding errors (e.g. `Could not locate the bindings file`)
**Solution**: Run `npm rebuild` inside `apps/api` to recompile the native addon against the current Node.js version. This is commonly needed after upgrading Node.js or switching machines.

## Further Reading

- [Setup Guide](docs/SETUP.md) — first-time setup from zero to running
- [Technical Documentation](docs/TECHNICAL.md) — architecture, data flows, and extension guide
- [API Reference](docs/API.md) — full endpoint documentation with request/response examples