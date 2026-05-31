# Technical Documentation

Detailed architecture, components, and data flows for the API.

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Module Structure](#3-module-structure)
4. [Data Flow](#4-data-flow)
5. [Shared Utilities](#5-shared-utilities)
6. [Error Handling](#6-error-handling)
7. [Validation](#7-validation)
8. [Database](#8-database)
9. [Testing Strategy](#9-testing-strategy)
10. [Extending the System](#10-extending-the-system)

---

## 1. Overview

The API is an Express 5 REST server written in TypeScript. It uses a modular structure where each domain (e.g. `users`, `healthcheck`) is fully self-contained. Prisma manages the SQLite database. All modules follow the same factory + controller + service + router pattern.

| Component | Technology | Purpose |
|-----------|------------|---------|
| HTTP framework | Express 5 | Routing, middleware, request/response handling |
| Language | TypeScript 6 | Type safety across the entire codebase |
| ORM | Prisma 7 | Type-safe database access, migrations |
| Database | SQLite + `better-sqlite3` | Embedded relational storage |
| Validation | Joi 18 | Schema-based input validation |
| Logging | Pino 10 | Structured JSON logging |
| Security | Helmet 8 | HTTP security headers |

---

## 2. Architecture

```
HTTP Client
     │
     ▼
┌────────────────────────────────────────────┐
│               Express App                  │
│                                            │
│  ┌──────────┐ ┌──────┐ ┌────────────────┐ │
│  │  Helmet  │ │ CORS │ │ RequestLogger  │ │
│  └──────────┘ └──────┘ └────────────────┘ │
│                                            │
│  ┌──────────────────┐ ┌─────────────────┐ │
│  │  /healthcheck    │ │     /users      │ │
│  │                  │ │                 │ │
│  │  HealthRouter    │ │   UsersRouter   │ │
│  │  HealthCtrl      │ │   UsersCtrl     │ │
│  │  HealthService   │ │   UsersService  │ │
│  └────────┬─────────┘ └────────┬────────┘ │
│           │                    │          │
│           └──────────┬─────────┘          │
│                      │                    │
│              ┌───────▼──────┐             │
│              │    Prisma    │             │
│              └───────┬──────┘             │
│                      │                    │
│           ┌──────────▼───────────┐        │
│           │    ErrorHandler      │        │
│           └──────────────────────┘        │
└──────────────────────┼────────────────────┘
                       │
                 ┌─────▼──────┐
                 │   SQLite   │
                 └────────────┘
```

### Application bootstrap sequence

1. `App.validateEnvironmentVariables()` — fails fast if `PORT`, `NODE_ENV`, or `DATABASE_URL` are missing
2. `App.setupDatabase()` — calls `prisma.$connect()`
3. `App.setupSecurityMiddlewares()` — mounts Helmet
4. `App.setupGlobalMiddlewares()` — mounts RequestLogger, CORS, body parsers
5. `App.setupRoutes()` — mounts module routers and the global error handler
6. `App.initServer()` — starts `http.Server.listen()`

Graceful shutdown (`SIGINT`/`SIGTERM`/`SIGQUIT`) calls `App.stopApplication()`, which closes the HTTP server then disconnects Prisma.

---

## 3. Module Structure

Every domain module follows the same file layout:

```
src/modules/<name>/
├── router.ts       # Express Router — maps HTTP methods/paths to controller methods
├── controller.ts   # Validates request, calls service, writes response
├── service.ts      # Business logic — interacts with Prisma
├── factory.ts      # Wires dependencies and returns a configured router instance
├── types.ts        # Interfaces for the service and controller
└── schemas.ts      # Joi validation schemas
```

### Factory pattern

Each module exports a `create<Name>Router()` function that instantiates its dependencies in order:

```typescript
// Example: users/factory.ts
export function createUsersRouter(): UsersRouter {
  const service = new UsersService();
  const controller = new UsersController(service);
  return new UsersRouter(controller);
}
```

`App.ts` calls these factories — it has no knowledge of the modules' internal dependencies.

---

## 4. Data Flow

### Successful request (e.g. `POST /users`)

```
Client
  │
  │ POST /users { "email": "alice@example.com" }
  ▼
RequestLogger middleware  →  logs incoming request
  │
  ▼
UsersRouter.post('/')
  │
  ▼
UsersController.createUser(req, res)
  │  SchemaValidator validates req.body against createUserSchema
  │  → throws ValidationError on failure
  ▼
UsersService.create(data)
  │  prisma.user.create({ data })
  ▼
Response: 201 { id, email, name, createdAt, updatedAt }
```

### Error path

```
UsersService.findById(999)  →  user not found
  │  throws NotFoundError("User not found", "USER_NOT_FOUND")
  ▼
ErrorHandler middleware
  │  err instanceof HttpError && err.isOperational === true
  │  logs warn with code + status
  ▼
Response: 404 { "error": "User not found", "code": "USER_NOT_FOUND" }
```

---

## 5. Shared Utilities

### Logger (`src/shared/logger.ts`)

Singleton Pino logger. Injected into `App` via the `ILogger` interface. Modules that need logging receive it through their constructor.

```typescript
interface ILogger {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}
```

### Types (`src/shared/types.ts`)

Contains `ExitStatus` enum (`SUCCESS = 0`, `FAILURE = 1`) and the `ILogger` interface.

### Prisma singleton (`src/lib/prisma.ts`)

Single `PrismaClient` instance shared across all modules. Uses the `better-sqlite3` adapter for synchronous SQLite I/O.

---

## 6. Error Handling

All errors extend `HttpError`:

| Class | HTTP Status | `isOperational` | Use Case |
|-------|:-----------:|:---------------:|----------|
| `BadRequestError` | 400 | `true` | Invalid input not caught by Joi |
| `ValidationError` | 400 | `true` | Joi schema failure — includes `validationErrors[]` |
| `NotFoundError` | 404 | `true` | Resource does not exist |
| `InternalServerError` | 500 | `false` | Unexpected system errors |

The global `errorHandler` middleware (mounted last) applies this logic:

- `isOperational === true` → logs `warn`, returns structured JSON with `error` + `code`
- `isOperational === false` or unknown error → logs `error`, returns generic `500`

`ValidationError` responses include an additional `validationErrors` array:

```json
{
  "error": "Validation failed",
  "code": "MISSING_OR_INVALID_PARAMETERS",
  "validationErrors": [
    {
      "fieldName": "email",
      "friendlyFieldName": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

---

## 7. Validation

`SchemaValidator` wraps Joi. Each controller method instantiates it with the relevant schema and calls `.validate(req)`:

```typescript
const { params, body } = new SchemaValidator(updateUserSchema).validate(req);
```

Validation schemas live in `modules/<name>/schemas.ts` and can validate `params`, `body`, and `query`.

---

## 8. Database

### Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Migrations vs. push

| Command | When to use |
|---------|-------------|
| `npm run db:push` | Development — applies schema changes without migration files |
| `npm run db:migrate` | When you need a migration history (named migration files) |
| `npm run db:migrate:deploy` | Production — applies pending migrations without prompts |

The Prisma client is generated into `src/generated/prisma/` — this directory is committed to the repo so the build does not require a generation step in CI.

---

## 9. Testing Strategy

| Layer | Tool | Config | What it tests |
|-------|------|--------|---------------|
| Unit | Jest + `ts-jest` | `jest.config.js` | Services and validators with mocked Prisma |
| Integration | Jest + Supertest | `jest.integration.config.js` | Full HTTP stack against a real SQLite database |

Integration tests run sequentially (`--runInBand`) to avoid database race conditions. The `test:integration` script pushes the schema to `test.db` before running.

Test files follow these naming conventions:
- `*.spec.ts` — unit tests, run by `jest.config.js`
- `*.test.ts` — integration tests, run by `jest.integration.config.js`

---

## 10. Extending the System

### Adding a new module

1. Create `src/modules/<name>/` with this layout:

```
src/modules/<name>/
├── types.ts        # IService and IController interfaces
├── service.ts      # implements IService, uses prisma
├── controller.ts   # implements IController, calls service
├── router.ts       # wires routes to controller methods
├── factory.ts      # create<Name>Router() function
└── schemas.ts      # Joi schemas for each endpoint
```

2. Add the model to `prisma/schema.prisma` and run `npm run db:migrate`.

3. Mount the router in `App.ts`:

```typescript
import { createThingsRouter } from './modules/things/factory';

// inside setupRoutes():
this.application.use('/things', createThingsRouter().getRouter());
```

4. Add unit tests in `src/modules/<name>/__tests__/<name>.spec.ts` and integration tests in `src/modules/<name>/__tests__/<name>.test.ts`.

### Adding a new middleware

Create the middleware in `src/middlewares/<name>.ts` with this signature:

```typescript
export function myMiddleware(logger: ILogger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // ...
    next();
  };
}
```

Mount it in `App.setupGlobalMiddlewares()` or `App.setupSecurityMiddlewares()` depending on its purpose.
