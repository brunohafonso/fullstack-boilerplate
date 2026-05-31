# API Reference

Full endpoint documentation for the REST API.

**Base URL**: `http://localhost:3001` (development)

---

## Table of Contents

1. [Response Format](#1-response-format)
2. [Error Format](#2-error-format)
3. [Health](#3-health)
4. [Users](#4-users)

---

## 1. Response Format

All responses are JSON. Successful responses return the resource directly (no wrapper envelope).

```json
// Single resource
{ "id": 1, "email": "alice@example.com", "name": "Alice", "createdAt": "...", "updatedAt": "..." }

// Collection
[ { "id": 1, ... }, { "id": 2, ... } ]
```

---

## 2. Error Format

All error responses follow this structure:

```json
{
  "error": "Human-readable description",
  "code": "MACHINE_READABLE_CODE"
}
```

Validation errors include an additional `validationErrors` array:

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

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Resource created |
| `204` | Success, no content (e.g. DELETE) |
| `400` | Bad request / validation error |
| `404` | Resource not found |
| `500` | Internal server error |

---

## 3. Health

### GET /healthcheck

Returns the application health status and database connectivity.

**Response `200`**

```json
{
  "name": "api",
  "version": "1.0.0",
  "uptime": "42 secs",
  "status": "HEALTHY",
  "database": {
    "status": "connected"
  }
}
```

**Response when database is unreachable**

```json
{
  "name": "api",
  "version": "1.0.0",
  "uptime": "42 secs",
  "status": "UNHEALTHY",
  "database": {
    "status": "disconnected",
    "error": "unable to open database file"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Application name |
| `version` | `string` | Application version from `package.json` |
| `uptime` | `string` | Process uptime in seconds |
| `status` | `"HEALTHY" \| "UNHEALTHY"` | Overall application status |
| `database.status` | `"connected" \| "disconnected"` | Database connectivity |
| `database.error` | `string?` | Error message when disconnected |

---

## 4. Users

### User object

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Auto-incremented integer primary key |
| `email` | `string` | Unique email address |
| `name` | `string \| null` | Optional display name |
| `createdAt` | `string` | ISO 8601 creation timestamp |
| `updatedAt` | `string` | ISO 8601 last-update timestamp |

---

### GET /users

Returns all users.

**Response `200`**

```json
[
  {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice",
    "createdAt": "2026-05-31T10:00:00.000Z",
    "updatedAt": "2026-05-31T10:00:00.000Z"
  }
]
```

Returns an empty array `[]` when no users exist.

---

### GET /users/:id

Returns a single user by ID.

**Path parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | `integer` (positive) | Yes | User ID |

**Response `200`**

```json
{
  "id": 1,
  "email": "alice@example.com",
  "name": "Alice",
  "createdAt": "2026-05-31T10:00:00.000Z",
  "updatedAt": "2026-05-31T10:00:00.000Z"
}
```

**Response `404`**

```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

---

### POST /users

Creates a new user.

**Request body**

```json
{
  "email": "alice@example.com",
  "name": "Alice"
}
```

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `email` | `string` (valid email) | Yes | Must be unique |
| `name` | `string` | No | Display name |

**Response `201`**

```json
{
  "id": 1,
  "email": "alice@example.com",
  "name": "Alice",
  "createdAt": "2026-05-31T10:00:00.000Z",
  "updatedAt": "2026-05-31T10:00:00.000Z"
}
```

**Response `400` — validation error**

```json
{
  "error": "Validation failed",
  "code": "MISSING_OR_INVALID_PARAMETERS",
  "validationErrors": [
    {
      "fieldName": "email",
      "friendlyFieldName": "email",
      "message": "\"email\" is required"
    }
  ]
}
```

---

### PATCH /users/:id

Updates one or more fields of an existing user.

**Path parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | `integer` (positive) | Yes | User ID |

**Request body** (all fields optional, at least one expected)

```json
{
  "email": "newemail@example.com",
  "name": "Alice Updated"
}
```

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| `email` | `string` (valid email) | No | New email |
| `name` | `string` | No | New display name |

**Response `200`**

```json
{
  "id": 1,
  "email": "newemail@example.com",
  "name": "Alice Updated",
  "createdAt": "2026-05-31T10:00:00.000Z",
  "updatedAt": "2026-05-31T11:00:00.000Z"
}
```

**Response `404`**

```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

---

### DELETE /users/:id

Deletes a user by ID.

**Path parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `id` | `integer` (positive) | Yes | User ID |

**Response `204`** — no content

**Response `404`**

```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```
