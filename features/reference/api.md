# API Reference

**Base path:** `/todo/`  
**Status:** Integrated API through **Feature 2** (authentication, sessions, list CRUD).  
**Authority for new work:** feature specs in `features/` — update this file in the same PR when routes or payloads change.

**Auth:** Send `Authorization: Bearer <token>` on protected routes.  
**Errors:** `{ "message": "Human-readable explanation." }` unless noted.

## Feature provenance

| Area | Feature |
|------|---------|
| Register, login, logout | 1 |
| List CRUD (`GET/POST/PUT/DELETE /todo/lists`) | 2 |

---

## Authentication (Feature 1)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/todo/register` | No | Create account |
| `POST` | `/todo/login` | No | Sign in; returns session payload |
| `POST` | `/todo/logout` | Yes | Invalidate session token |

**Register body:**
```json
{
  "fName": "Jane",
  "lName": "Doe",
  "email": "jdoe@example.com",
  "username": "jdoe",
  "password": "password123"
}
```

**Login body:**
```json
{
  "username": "jdoe",
  "password": "password123"
}
```

**Register / login success** (`201` register · `200` login):
```json
{
  "userId": 1,
  "username": "jdoe",
  "email": "jdoe@example.com",
  "fName": "Jane",
  "lName": "Doe",
  "role": "worker",
  "token": "<jwt>"
}
```

Password hashes are never returned.

**Logout success** (`200`):
```json
{
  "message": "Signed out successfully."
}
```

**Common auth errors:** missing fields `400`; password < 8 chars `400` with `"Password must be at least 8 characters."`; duplicate username `400` with `"Username is already taken."`; duplicate email `400` with `"Email is already registered."`; invalid login `401` with `"Invalid username or password."`; missing token on protected routes `401` with `"Unauthorized! No token provided."`; invalid or expired token `401` with `"Unauthorized! Invalid or expired token."`

---

## Lists (Feature 2)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/todo/lists` | Yes | Lists owned by caller (array, ordered by `name` ASC) |
| `POST` | `/todo/lists` | Yes | Create a new list |
| `PUT` | `/todo/lists/:listId` | Yes | Rename a list |
| `DELETE` | `/todo/lists/:listId` | Yes | Delete a list owned by the caller |

**Create / rename body:**
```json
{ "name": "Groceries" }
```

Client-supplied `userId` in the body is ignored on create; ownership is always `req.user.id`.

**List success** (`200` / `201`):
```json
{
  "id": 1,
  "name": "Groceries",
  "userId": 42,
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

**Delete success** (`200`):
```json
{ "message": "List deleted successfully." }
```

**Validation errors:** empty/whitespace name `400` with `"List name is required."`; name > 100 chars `400` with `"List name must be 100 characters or fewer."`; invalid `listId` `400`; unowned list `404` with `"List with id=<id> not found."`; unauthenticated `401`.
