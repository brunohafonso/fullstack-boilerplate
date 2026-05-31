# Setup Guide

Step-by-step guide to configure the API from scratch.

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone and Configure](#2-clone-and-configure)
3. [Install Dependencies](#3-install-dependencies)
4. [Set Up the Database](#4-set-up-the-database)
5. [Start the Server](#5-start-the-server)
6. [Verify It Works](#6-verify-it-works)
7. [Running Tests](#7-running-tests)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequisites

Before starting, make sure you have:

- [ ] Node.js 24+ installed
- [ ] npm 10+ installed
- [ ] Git

### Verify Node.js version

```bash
node --version
# Expected: v24.x.x or higher

npm --version
# Expected: 10.x.x or higher
```

---

## 2. Clone and Configure

If working from the monorepo root:

```bash
git clone <repo-url> fullstack-boilerplate
cd fullstack-boilerplate/apps/api
```

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```bash
# =============================================================================
# Application
# =============================================================================
NODE_ENV="development"
PORT=3001

# =============================================================================
# Database (SQLite)
# =============================================================================
# Relative path to the SQLite database file
DATABASE_URL="file:./dev.db"
```

All three variables are required. The server will refuse to start if any is missing.

---

## 3. Install Dependencies

From the monorepo root (recommended):

```bash
cd fullstack-boilerplate
npm install
# Expected: packages installed, no errors
```

Or from the API directory directly:

```bash
cd apps/api
npm install
```

---

## 4. Set Up the Database

Generate the Prisma client and apply the schema to the SQLite file:

```bash
npm run db:generate
# Expected: Prisma client generated in src/generated/prisma

npm run db:push
# Expected: Database schema applied to dev.db
```

> **Note**: `db:push` is for development. For production use `npm run db:migrate:deploy`.

### Optional: open Prisma Studio

```bash
npm run db:studio
# Expected: browser opens at http://localhost:5555
```

---

## 5. Start the Server

```bash
npm run start:dev
# Expected: server listening on port 3001 in development environment
```

The server watches for file changes and restarts automatically via `tsx watch`.

---

## 6. Verify It Works

```bash
curl http://localhost:3001/healthcheck
# Expected:
# {
#   "name": "api",
#   "version": "1.0.0",
#   "uptime": "5 secs",
#   "status": "HEALTHY",
#   "database": { "status": "connected" }
# }
```

```bash
curl http://localhost:3001/users
# Expected: []
```

---

## 7. Running Tests

### Unit tests

```bash
npm run test:unit
# Expected: all .spec.ts tests pass
```

Unit tests use mocked dependencies and do not require a database.

### Integration tests

Integration tests need their own environment. Configure `.env.test`:

```bash
# .env.test
NODE_ENV="test"
PORT=3002
DATABASE_URL="file:./test.db"
```

Then run:

```bash
npm run test:integration
# Expected: schema is pushed to test.db, all .test.ts tests pass
```

> **Warning**: Integration tests push the schema to `test.db` before each run, resetting data.

### All tests

```bash
npm run test:all
# Expected: unit tests pass, then integration tests pass
```

---

## 8. Troubleshooting

**Problem**: `Missing required environment variables: PORT, NODE_ENV, DATABASE_URL`
**Solution**: Make sure `.env` exists and all three variables are set. The server reads from `.env.development` when using `start:dev` — verify that file exists too.

**Problem**: `Cannot find module '../../generated/prisma'`
**Solution**: Run `npm run db:generate`. The Prisma client must be generated before the TypeScript compiler can resolve it.

**Problem**: `SQLITE_ERROR: no such table: User`
**Solution**: The database schema hasn't been applied. Run `npm run db:push` to sync the schema.

**Problem**: Integration tests fail with `ENOENT: no such file or directory, open './test.db'`
**Solution**: Make sure `.env.test` has `DATABASE_URL="file:./test.db"`. The `test:integration` script runs `prisma db push` first, which creates the file.

**Problem**: Port 3001 already in use
**Solution**: Either change `PORT` in `.env` or stop the process using the port: `lsof -ti:3001 | xargs kill -9`.

**Problem**: `tsx` command not found
**Solution**: Run `npm install` from either the monorepo root or `apps/api` to install dev dependencies.

**Problem**: `better-sqlite3` native binding errors (e.g. `Could not locate the bindings file`)
**Solution**: Run `npm rebuild` inside `apps/api` to recompile the native addon against the current Node.js version. This is commonly needed after upgrading Node.js or switching machines.

---

## Next Steps

- [ ] Review [API Reference](API.md) to explore available endpoints
- [ ] Review [Technical Documentation](TECHNICAL.md) to understand the architecture
- [ ] Run `npm run lint` and ensure no errors before committing
- [ ] Set up your editor to use the project's ESLint and Prettier configs
